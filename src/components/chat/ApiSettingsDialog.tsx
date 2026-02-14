import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileUp, Plus, Settings, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ChatApiConfig } from "@/types/chat";
import { testApiConnection } from "@/services/aiChatApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiSettingsDialogProps {
  apiConfig: ChatApiConfig;
  selectedModelId: string;
  customModels: string[];
  onApply: (payload: {
    apiConfig: ChatApiConfig;
    customModels: string[];
    selectedModelId?: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const SUGGESTED_MODELS = [
  "deepseek-v3-2-251201",
  "glm-4-7-251222",
  "kimi-k2-250905",
  "kimi-k2-thinking-251104",
  "seed-1-8-251228",
];

function sanitizeModels(list: string[]): string[] {
  return Array.from(new Set(list.map((item) => item.trim()).filter(Boolean)));
}

export function ApiSettingsDialog({
  apiConfig,
  selectedModelId,
  customModels,
  onApply,
  disabled,
}: ApiSettingsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [baseURL, setBaseURL] = useState(apiConfig.baseURL);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [referer, setReferer] = useState(apiConfig.referer);
  const [siteTitle, setSiteTitle] = useState(apiConfig.siteTitle);
  const [models, setModels] = useState<string[]>(customModels);
  const [newModel, setNewModel] = useState("");
  const [preferredModel, setPreferredModel] = useState(selectedModelId);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modelCountLabel = useMemo(() => `${models.length} model custom`, [models.length]);

  useEffect(() => {
    if (!open) {
      setBaseURL(apiConfig.baseURL);
      setApiKey(apiConfig.apiKey);
      setReferer(apiConfig.referer);
      setSiteTitle(apiConfig.siteTitle);
      setModels(customModels);
      setPreferredModel(selectedModelId);
      setNewModel("");
    }
  }, [apiConfig, customModels, open, selectedModelId]);

  const handleAddModel = (modelId: string) => {
    const value = modelId.trim();
    if (!value) return;
    setModels((prev) => sanitizeModels([...prev, value]));
    setNewModel("");
  };

  const handleRemoveModel = (modelId: string) => {
    setModels((prev) => prev.filter((item) => item !== modelId));
  };

  const handleSave = async () => {
    if (!baseURL.trim()) {
      toast.error("Base URL wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      await onApply({
        apiConfig: {
          baseURL: baseURL.trim(),
          apiKey: apiKey.trim(),
          referer: referer.trim(),
          siteTitle: siteTitle.trim(),
        },
        customModels: sanitizeModels(models),
        selectedModelId: preferredModel.trim() || undefined,
      });
      setOpen(false);
      toast.success("Konfigurasi berhasil disimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    const modelToTest = preferredModel.trim() || models[0] || selectedModelId;
    setIsTesting(true);
    const result = await testApiConnection(
      {
        baseURL: baseURL.trim(),
        apiKey: apiKey.trim(),
        referer: referer.trim(),
        siteTitle: siteTitle.trim(),
      },
      modelToTest
    );
    setIsTesting(false);

    if (result.ok) {
      toast.success(`Tes API sukses (${modelToTest})`);
      return;
    }

    toast.error(`Tes API gagal: ${result.message}`);
  };

  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      apiConfig: {
        baseURL: baseURL.trim(),
        apiKey: apiKey.trim(),
        referer: referer.trim(),
        siteTitle: siteTitle.trim(),
      },
      selectedModelId: preferredModel.trim(),
      customModels: sanitizeModels(models),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Konfigurasi berhasil diexport");
  };

  const handleImportFile = async (file?: File) => {
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as {
        apiConfig?: Partial<ChatApiConfig>;
        selectedModelId?: string;
        customModels?: string[];
      };

      if (parsed.apiConfig) {
        setBaseURL(parsed.apiConfig.baseURL || baseURL);
        setApiKey(parsed.apiConfig.apiKey || "");
        setReferer(parsed.apiConfig.referer || referer);
        setSiteTitle(parsed.apiConfig.siteTitle || siteTitle);
      }

      if (parsed.selectedModelId) {
        setPreferredModel(parsed.selectedModelId);
      }

      if (Array.isArray(parsed.customModels)) {
        setModels(sanitizeModels(parsed.customModels));
      }

      toast.success("Konfigurasi berhasil diimport. Klik Simpan untuk menerapkan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File konfigurasi tidak valid");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setting API & Model AI</DialogTitle>
          <DialogDescription>
            Tes API, kelola model custom, dan export/import konfigurasi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="api-base-url">Base URL</Label>
              <Input
                id="api-base-url"
                placeholder="https://openrouter.ai/api/v1"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Kosongkan untuk pakai API key dari .env"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="api-referer">HTTP Referer</Label>
              <Input
                id="api-referer"
                placeholder="https://your-site.com"
                value={referer}
                onChange={(e) => setReferer(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="api-title">X-Title</Label>
              <Input
                id="api-title"
                placeholder="Al-Quran App"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Model Custom</p>
              <span className="text-xs text-muted-foreground">{modelCountLabel}</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="contoh: openrouter/aurora-alpha"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddModel(newModel);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => handleAddModel(newModel)}>
                <Plus className="h-4 w-4 mr-1" /> Tambah
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_MODELS.map((modelId) => (
                <Button
                  key={modelId}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddModel(modelId)}
                >
                  + {modelId}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              {models.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada model custom.</p>
              ) : (
                models.map((modelId) => (
                  <div key={modelId} className="flex items-center justify-between rounded-md border px-2 py-1.5">
                    <span className="text-xs sm:text-sm break-all pr-2">{modelId}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRemoveModel(modelId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="selected-model">Model Aktif</Label>
              <Input
                id="selected-model"
                placeholder="Model yang dipakai untuk chat"
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border p-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleTest} disabled={isTesting}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              {isTesting ? "Testing..." : "Tes API"}
            </Button>

            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" /> Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => handleImportFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !baseURL.trim()}>
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
