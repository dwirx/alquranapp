import { MessageSquareText, Plus, Trash2 } from "lucide-react";
import { ResponsiveLayout } from "@/components/layout";
import { ChatContainer, ChatHistory } from "@/components/chat";
import { useChatHistory } from "@/hooks/useChatHistory";
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

const AiChatPage = () => {
  const {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    clearAllHistory,
  } = useChatHistory();

  return (
    <ResponsiveLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
          <div className="container py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">AI Chat Al-Quran</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Tanya apa saja tentang Al-Quran
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* New Chat Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={createSession}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat Baru</span>
                </Button>

                {/* History Sheet (Mobile) */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <MessageSquareText className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0">
                    <SheetHeader className="p-4 border-b border-border">
                      <SheetTitle>Riwayat Chat</SheetTitle>
                    </SheetHeader>
                    <ChatHistory
                      sessions={sessions}
                      currentSessionId={currentSessionId}
                      onSelectSession={switchSession}
                      onDeleteSession={deleteSession}
                      onNewSession={createSession}
                    />
                    {sessions.length > 0 && (
                      <div className="p-4 border-t border-border">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus Semua Riwayat
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
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat History Sidebar (Desktop) */}
          <aside className="hidden lg:flex w-72 border-r border-border bg-card/50 flex-col">
            <ChatHistory
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={switchSession}
              onDeleteSession={deleteSession}
              onNewSession={createSession}
            />
            {sessions.length > 0 && (
              <div className="p-4 border-t border-border">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
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
          <main className="flex-1 overflow-hidden">
            <ChatContainer />
          </main>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default AiChatPage;
