"use client";

import React, { useState } from "react";
import { Send, Lock, Unlock, Plus, Trash2, Shield, Globe, Cpu } from "lucide-react";
import { Button, Input, Badge, Switch, Label, Tabs } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { HttpRequestData, HttpMethod, HttpVersion } from "@/features/protocols/http/http.types";

interface HttpRequestBuilderProps {
  request: HttpRequestData;
  onChangeRequest: (req: HttpRequestData) => void;
  onSendRequest: () => void;
  isLoading?: boolean;
}

export function HttpRequestBuilder({
  request,
  onChangeRequest,
  onSendRequest,
  isLoading = false,
}: HttpRequestBuilderProps) {
  const [activeTab, setActiveTab] = useState("headers");

  const methodColors: Record<HttpMethod, string> = {
    GET: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    POST: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    PUT: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    DELETE: "text-red-400 border-red-500/30 bg-red-500/10",
    PATCH: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    HEAD: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    OPTIONS: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  };

  const handleMethodChange = (method: HttpMethod) => {
    onChangeRequest({
      ...request,
      method,
    });
  };

  const handleUrlChange = (url: string) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      onChangeRequest({
        ...request,
        url,
        host: parsed.host || "api.network.local",
        path: parsed.pathname || "/",
        scheme: parsed.protocol.replace(":", "") as "http" | "https",
        useTls: parsed.protocol === "https:",
      });
    } catch {
      onChangeRequest({
        ...request,
        url,
      });
    }
  };

  const handleTlsToggle = (useTls: boolean) => {
    const scheme = useTls ? "https" : "http";
    const newUrl = request.url.replace(/^https?:\/\//, `${scheme}://`);
    onChangeRequest({
      ...request,
      scheme,
      useTls,
      url: newUrl,
    });
  };

  const handleVersionChange = (version: HttpVersion) => {
    onChangeRequest({
      ...request,
      version,
    });
  };

  const handleHeaderToggle = (index: number, enabled: boolean) => {
    const updated = [...request.headers];
    updated[index] = { ...updated[index], enabled };
    onChangeRequest({ ...request, headers: updated });
  };

  const handleHeaderChange = (index: number, field: "name" | "value", val: string) => {
    const updated = [...request.headers];
    updated[index] = { ...updated[index], [field]: val };
    onChangeRequest({ ...request, headers: updated });
  };

  const handleAddHeader = () => {
    onChangeRequest({
      ...request,
      headers: [
        ...request.headers,
        { name: "X-Custom-Header", value: "custom-value", enabled: true, category: "general" },
      ],
    });
  };

  const handleDeleteHeader = (index: number) => {
    onChangeRequest({
      ...request,
      headers: request.headers.filter((_, i) => i !== index),
    });
  };

  const handleBodyChange = (body: string) => {
    onChangeRequest({
      ...request,
      body,
    });
  };

  return (
    <div className="border border-border rounded-xl bg-card p-3 shadow-sm space-y-3">
      {/* Top Bar: Method + URL + Send Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Method Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={request.method}
            onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
            className={cn(
              "h-9 px-3 rounded-lg border font-mono font-bold text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary",
              methodColors[request.method]
            )}
            aria-label="HTTP Method"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="OPTIONS">OPTIONS</option>
            <option value="HEAD">HEAD</option>
          </select>
        </div>

        {/* URL Input Bar */}
        <div className="flex-1 relative flex items-center">
          <div className="absolute left-2.5 flex items-center gap-1 text-muted-foreground pointer-events-none">
            {request.useTls ? (
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-amber-400" />
            )}
          </div>
          <Input
            value={request.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="pl-8 h-9 text-xs font-mono bg-background"
            placeholder="https://api.network.local/v1/resource"
          />
        </div>

        {/* Protocol Settings & Send Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* HTTPS Switch */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border bg-secondary/30 text-xs">
            <Label htmlFor="https-toggle" className="text-[11px] font-medium cursor-pointer">
              {request.useTls ? "HTTPS :443" : "HTTP :80"}
            </Label>
            <Switch
              id="https-toggle"
              checked={request.useTls}
              onCheckedChange={handleTlsToggle}
            />
          </div>

          {/* HTTP Version Select */}
          <select
            value={request.version}
            onChange={(e) => handleVersionChange(e.target.value as HttpVersion)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-mono cursor-pointer"
            aria-label="HTTP Version"
          >
            <option value="HTTP/2">HTTP/2</option>
            <option value="HTTP/1.1">HTTP/1.1</option>
            <option value="HTTP/3">HTTP/3 (QUIC)</option>
          </select>

          {/* Send Trigger */}
          <Button
            size="sm"
            variant="default"
            onClick={onSendRequest}
            disabled={isLoading}
            className="h-9 px-4 font-semibold text-xs gap-1.5 shadow-sm cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        </div>
      </div>

      {/* Tabs: Headers & Body & TLS Configuration */}
      <div className="space-y-2 pt-1 border-t border-border/50">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            { id: "headers", label: `Headers (${request.headers.filter((h) => h.enabled).length})` },
            { id: "body", label: "Request Body (JSON / Raw)" },
            { id: "tls", label: "TLS & Security Specs" },
          ]}
        />

        {/* Headers Editor Tab */}
        {activeTab === "headers" && (
          <div className="space-y-2 pt-1">
            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
              {request.headers.map((header, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => handleHeaderToggle(idx, e.target.checked)}
                    className="rounded border-border cursor-pointer h-3.5 w-3.5"
                  />
                  <Input
                    value={header.name}
                    onChange={(e) => handleHeaderChange(idx, "name", e.target.value)}
                    placeholder="Header Key (e.g. Authorization)"
                    className="h-7 text-xs font-mono flex-1 bg-background"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => handleHeaderChange(idx, "value", e.target.value)}
                    placeholder="Header Value"
                    className="h-7 text-xs font-mono flex-[2] bg-background"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteHeader(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddHeader}
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Header
              </Button>
              <div className="flex gap-1.5 text-[10px]">
                <Badge variant="outline" className="font-mono text-muted-foreground">Host: {request.host}</Badge>
                <Badge variant="outline" className="font-mono text-muted-foreground">Path: {request.path}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Body Editor Tab */}
        {activeTab === "body" && (
          <div className="space-y-2 pt-1">
            <textarea
              value={request.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder='{\n  "key": "value"\n}'
              className="w-full h-24 p-2.5 rounded-lg border border-border bg-background font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Format: application/json or raw text</span>
              <span>Payload: {request.body ? request.body.length : 0} bytes</span>
            </div>
          </div>
        )}

        {/* TLS Settings Tab */}
        {activeTab === "tls" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-2 rounded-lg border border-border bg-secondary/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <Shield className="h-3.5 w-3.5" />
                <span>TLS Handshake</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Protocol version: {request.useTls ? request.tlsVersion : "Plaintext (None)"}
              </p>
              <Badge variant="default" className="text-[9px]">
                {request.useTls ? "1-RTT Key Exchange" : "No Encryption"}
              </Badge>
            </div>

            <div className="p-2 rounded-lg border border-border bg-secondary/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                <Globe className="h-3.5 w-3.5" />
                <span>SNI & ALPN</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                SNI: {request.host}
              </p>
              <Badge variant="outline" className="text-[9px] font-mono">
                ALPN: {request.version === "HTTP/2" ? "h2" : "http/1.1"}
              </Badge>
            </div>

            <div className="p-2 rounded-lg border border-border bg-secondary/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Cpu className="h-3.5 w-3.5" />
                <span>Cipher Suite</span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                TLS_AES_256_GCM_SHA384
              </p>
              <Badge variant="outline" className="text-[9px] text-emerald-400">
                AEAD Symmetric Key
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
