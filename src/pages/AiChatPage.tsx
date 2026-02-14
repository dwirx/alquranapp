import { useState } from "react";
import { MessageSquareText, Plus, Trash2, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveLayout } from "@/components/layout";
import { ChatContainer, ChatHistory } from "@/components/chat";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AiChatPageContent = () => {
  const {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    clearAllHistory,
  } = useChat();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  return (
    <ResponsiveLayout showHeader={false} withBottomNavPadding={false}>
      <div className="flex flex-col h-full lg:h-screen min-h-0">
        {/* Header */}
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/40 glass-effect">
          <div className="container py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Desktop Sidebar Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="hidden lg:flex h-9 w-9 text-muted-foreground mr-1"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>

                <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground leading-none">AI Ustadz</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block mt-1">
                    Asisten Cerdas Al-Quran Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* New Chat Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-9 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                  onClick={createSession}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Baru</span>
                </Button>

                {/* History Sheet (Mobile) */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-muted-foreground">
                      <MessageSquareText className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] max-w-sm p-0 glass-effect border-l border-border/40">
                    <SheetHeader className="p-4 border-b border-border/40">
                      <SheetTitle className="text-left">Riwayat Percakapan</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                      <ChatHistory
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onSelectSession={switchSession}
                        onDeleteSession={deleteSession}
                        onNewSession={createSession}
                      />
                    </div>
                    {sessions.length > 0 && (
                      <div className="p-4 border-t border-border/40">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start px-2"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus Semua Riwayat
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-effect border-border/40">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Semua Riwayat?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Semua percakapan akan dihapus permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-background/50">Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={clearAllHistory}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus Semua
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Chat History Sidebar (Desktop) */}
          <aside
            className={cn(
              "hidden lg:flex border-r border-border/40 glass-effect flex-col transition-all duration-300 ease-in-out",
              isHistoryOpen ? "w-80 xl:w-96 opacity-100" : "w-0 opacity-0 overflow-hidden border-none"
            )}
          >
            <div className="flex-1 overflow-y-auto">
              <ChatHistory
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={switchSession}
                onDeleteSession={deleteSession}
                onNewSession={createSession}
              />
            </div>
            {sessions.length > 0 && (
              <div className="p-4 border-t border-border/40">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start px-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Semua
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Semua Riwayat?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Semua percakapan akan dihapus permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearAllHistory}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Hapus Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </aside>

          {/* Chat Container */}
          <main className="flex-1 overflow-hidden min-h-0">
            <ChatContainer />
          </main>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

const AiChatPage = () => {
  return (
    <ChatProvider>
      <AiChatPageContent />
    </ChatProvider>
  );
};

export default AiChatPage;
