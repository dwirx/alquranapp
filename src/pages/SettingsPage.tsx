import { Settings, Moon, Sun, Monitor, Type, BookOpen, Volume2, RotateCcw, History } from "lucide-react";
import { ResponsiveLayout } from "@/components/layout";
import { useSettings } from "@/hooks/useSettings";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { history, clearHistory } = useReadingHistory();

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Terang" },
    { value: "dark" as const, icon: Moon, label: "Gelap" },
    { value: "system" as const, icon: Monitor, label: "Sistem" },
  ];

  const fontSizeOptions = [
    { value: "small" as const, label: "Kecil", size: "text-sm" },
    { value: "medium" as const, label: "Sedang", size: "text-base" },
    { value: "large" as const, label: "Besar", size: "text-lg" },
  ];

  return (
    <ResponsiveLayout>
      {/* Header - Mobile only */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border lg:hidden">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Pengaturan</h1>
              <p className="text-xs text-muted-foreground">
                Kustomisasi pengalaman membaca Anda
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
              <p className="text-sm text-muted-foreground">
                Kustomisasi pengalaman membaca Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4 sm:py-6 space-y-6">
        {/* Settings Grid for Desktop */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Theme Section */}
          <section className="space-y-3 p-4 lg:p-6 rounded-xl bg-card border border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              Tema
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => updateSetting("theme", value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    settings.theme === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font Size Section */}
          <section className="space-y-3 p-4 lg:p-6 rounded-xl bg-card border border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Ukuran Font
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {fontSizeOptions.map(({ value, label, size }) => (
                <button
                  key={value}
                  onClick={() => updateSetting("fontSize", value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    settings.fontSize === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <span className={cn("font-arabic", size)}>ا</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Reading Options */}
          <section className="space-y-3 p-4 lg:p-6 rounded-xl bg-card border border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Opsi Bacaan
            </h2>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Tampilkan Latin</p>
                  <p className="text-xs text-muted-foreground">Transliterasi latin ayat</p>
                </div>
                <Switch
                  checked={settings.showLatin}
                  onCheckedChange={(checked) => updateSetting("showLatin", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Tampilkan Terjemahan</p>
                  <p className="text-xs text-muted-foreground">Terjemahan bahasa Indonesia</p>
                </div>
                <Switch
                  checked={settings.showTranslation}
                  onCheckedChange={(checked) => updateSetting("showTranslation", checked)}
                />
              </div>
            </div>
          </section>

          {/* Audio Options */}
          <section className="space-y-3 p-4 lg:p-6 rounded-xl bg-card border border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              Audio
            </h2>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Putar Otomatis</p>
                <p className="text-xs text-muted-foreground">Lanjutkan ke ayat berikutnya</p>
              </div>
              <Switch
                checked={settings.autoPlayNext}
                onCheckedChange={(checked) => updateSetting("autoPlayNext", checked)}
              />
            </div>
          </section>
        </div>

        {/* History Section */}
        <section className="space-y-3 p-4 lg:p-6 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Riwayat
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Hapus Riwayat Bacaan</p>
              <p className="text-xs text-muted-foreground">
                {history.length} item dalam riwayat
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              disabled={history.length === 0}
              className="text-destructive hover:text-destructive"
            >
              Hapus
            </Button>
          </div>
        </section>

        {/* Reset Settings */}
        <section className="pt-4">
          <Button
            variant="outline"
            className="w-full lg:w-auto"
            onClick={resetSettings}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Atur Ulang Semua Pengaturan
          </Button>
        </section>

        {/* App Info */}
        <section className="pt-4 pb-8">
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Quran App v1.0.0</p>
            <p>
              Sumber data:{" "}
              <a
                href="https://equran.id"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                eQuran.id
              </a>
            </p>
          </div>
        </section>
      </div>
    </ResponsiveLayout>
  );
};

export default SettingsPage;
