import type { BgpRoute, BgpBestPathComparisonStep } from "./bgp.types";

export interface BgpBestPathEvaluationResult {
  bestRoute: BgpRoute | null;
  evaluatedRoutes: BgpRoute[];
  comparisonSteps: BgpBestPathComparisonStep[];
  winningReason: string;
}

export function evaluateBgpBestPath(
  routes: BgpRoute[],
  localAsn: number
): BgpBestPathEvaluationResult {
  if (routes.length === 0) {
    return {
      bestRoute: null,
      evaluatedRoutes: [],
      comparisonSteps: [],
      winningReason: "No candidate routes available in BGP table.",
    };
  }

  // Filter out invalid routes or AS loop routes
  const validRoutes = routes.map((r) => {
    // AS Loop detection: if localAsn appears in asPath
    if (r.asPath.includes(localAsn)) {
      return {
        ...r,
        valid: false,
        best: false,
        rejectionReason: `AS Loop Detected: Local ASN ${localAsn} already appears in AS_PATH [${r.asPath.join(" ")}].`,
      };
    }
    return { ...r, valid: true, best: false };
  });

  const candidates = validRoutes.filter((r) => r.valid);

  if (candidates.length === 0) {
    return {
      bestRoute: null,
      evaluatedRoutes: validRoutes,
      comparisonSteps: [],
      winningReason: "All candidate routes were rejected due to AS loops or invalid next-hops.",
    };
  }

  if (candidates.length === 1) {
    candidates[0].best = true;
    candidates[0].rejectionReason = undefined;
    return {
      bestRoute: candidates[0],
      evaluatedRoutes: validRoutes,
      comparisonSteps: [
        {
          stepNumber: 1,
          criterion: "Single Valid Candidate",
          winnerRouteId: candidates[0].id,
          description: `Only one valid path available toward prefix ${candidates[0].prefix}.`,
          candidateA: { pathName: `Path via ${candidates[0].nextHop}`, value: "Valid", preferred: true },
          candidateB: { pathName: "None", value: "—", preferred: false },
          winningReason: "Only valid route available in BGP RIB.",
        },
      ],
      winningReason: "Only available candidate path.",
    };
  }

  // We compare candidate A and candidate B
  const pathA = candidates[0];
  const pathB = candidates[1];
  const steps: BgpBestPathComparisonStep[] = [];
  let winningRoute: BgpRoute = pathA;
  let winningReason = "";

  // Step 1: Valid Route Check
  steps.push({
    stepNumber: 1,
    criterion: "1. Next-Hop Reachability",
    winnerRouteId: null,
    description: "Both candidate paths have reachable next-hop IP addresses.",
    candidateA: { pathName: `Path A (${pathA.nextHop})`, value: "Reachable", preferred: true },
    candidateB: { pathName: `Path B (${pathB.nextHop})`, value: "Reachable", preferred: true },
  });

  // Step 2: Highest LOCAL_PREF
  if (pathA.localPreference !== pathB.localPreference) {
    const aWins = pathA.localPreference > pathB.localPreference;
    winningRoute = aWins ? pathA : pathB;
    const losingRoute = aWins ? pathB : pathA;
    winningReason = `Higher LOCAL_PREF (${winningRoute.localPreference} vs ${losingRoute.localPreference})`;

    steps.push({
      stepNumber: 2,
      criterion: "2. Prefer Highest LOCAL_PREF",
      winnerRouteId: winningRoute.id,
      description: `Path with LOCAL_PREF ${winningRoute.localPreference} is preferred over ${losingRoute.localPreference}.`,
      candidateA: { pathName: "Path A", value: pathA.localPreference, preferred: aWins },
      candidateB: { pathName: "Path B", value: pathB.localPreference, preferred: !aWins },
      eliminatedPath: losingRoute.id,
      winningReason,
    });
  } else {
    steps.push({
      stepNumber: 2,
      criterion: "2. Prefer Highest LOCAL_PREF",
      winnerRouteId: null,
      description: `Both paths have identical LOCAL_PREF (${pathA.localPreference}). Proceeding to AS_PATH comparison.`,
      candidateA: { pathName: "Path A", value: pathA.localPreference, preferred: true },
      candidateB: { pathName: "Path B", value: pathB.localPreference, preferred: true },
    });

    // Step 3: Shortest AS_PATH
    const lenA = pathA.asPath.length;
    const lenB = pathB.asPath.length;

    if (lenA !== lenB) {
      const aWins = lenA < lenB;
      winningRoute = aWins ? pathA : pathB;
      const losingRoute = aWins ? pathB : pathA;
      winningReason = `Shorter AS_PATH (${winningRoute.asPath.length} hops [${winningRoute.asPath.join(" ")}] vs ${losingRoute.asPath.length} hops [${losingRoute.asPath.join(" ")}])`;

      steps.push({
        stepNumber: 3,
        criterion: "3. Prefer Shorter AS_PATH",
        winnerRouteId: winningRoute.id,
        description: `Path with ${winningRoute.asPath.length} AS hops is shorter than ${losingRoute.asPath.length} hops.`,
        candidateA: { pathName: "Path A", value: `${lenA} hops (${pathA.asPath.join(" ")})`, preferred: aWins },
        candidateB: { pathName: "Path B", value: `${lenB} hops (${pathB.asPath.join(" ")})`, preferred: !aWins },
        eliminatedPath: losingRoute.id,
        winningReason,
      });
    } else {
      steps.push({
        stepNumber: 3,
        criterion: "3. Prefer Shorter AS_PATH",
        winnerRouteId: null,
        description: `Both paths have identical AS_PATH length (${lenA} hops). Proceeding to MED comparison.`,
        candidateA: { pathName: "Path A", value: `${lenA} hops`, preferred: true },
        candidateB: { pathName: "Path B", value: `${lenB} hops`, preferred: true },
      });

      // Step 4: Lowest MED
      if (pathA.med !== pathB.med) {
        const aWins = pathA.med < pathB.med;
        winningRoute = aWins ? pathA : pathB;
        const losingRoute = aWins ? pathB : pathA;
        winningReason = `Lowest MED (${winningRoute.med} vs ${losingRoute.med})`;

        steps.push({
          stepNumber: 4,
          criterion: "4. Prefer Lowest MED",
          winnerRouteId: winningRoute.id,
          description: `Lower Multi-Exit Discriminator (MED ${winningRoute.med}) preferred over MED ${losingRoute.med}.`,
          candidateA: { pathName: "Path A", value: `MED ${pathA.med}`, preferred: aWins },
          candidateB: { pathName: "Path B", value: `MED ${pathB.med}`, preferred: !aWins },
          eliminatedPath: losingRoute.id,
          winningReason,
        });
      } else {
        // Step 5: Tie break
        winningRoute = pathA;
        winningReason = "Tie-break: Lowest BGP Next-Hop / Peer IP";
        steps.push({
          stepNumber: 5,
          criterion: "5. Lowest Next-Hop IP Tie-Break",
          winnerRouteId: pathA.id,
          description: `All attributes equal. Tie broken in favor of lower Next-Hop IP (${pathA.nextHop}).`,
          candidateA: { pathName: "Path A", value: pathA.nextHop, preferred: true },
          candidateB: { pathName: "Path B", value: pathB.nextHop, preferred: false },
          winningReason,
        });
      }
    }
  }

  // Mark best and rejected reasons
  const evaluatedRoutes = validRoutes.map((r) => {
    if (r.id === winningRoute.id) {
      return { ...r, best: true, rejectionReason: undefined };
    }
    if (r.valid) {
      return {
        ...r,
        best: false,
        rejectionReason: `Rejected in favor of Best Path: ${winningReason}`,
      };
    }
    return r;
  });

  return {
    bestRoute: winningRoute,
    evaluatedRoutes,
    comparisonSteps: steps,
    winningReason,
  };
}
