"use client";

import {
  AlertCircle,
  Check,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
  RefreshCw,
  Rss,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { timeAgo } from "~/lib/format";
import { api, type RouterOutputs } from "~/trpc/react";

type SourceRow = RouterOutputs["source"]["list"][number];
type FolderRow = RouterOutputs["folder"]["list"][number];

/** Sentinels for selects (base-ui Select values must be strings). */
const NONE = "__none__";
const NEW = "__new__";

export function SourcesSheet() {
  const [open, setOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [addFolderId, setAddFolderId] = useState<string>(NONE);
  const [newFolder, setNewFolder] = useState("");
  const utils = api.useUtils();
  const sources = api.source.list.useQuery();
  const folders = api.folder.list.useQuery();

  const invalidate = () => {
    void utils.source.list.invalidate();
    void utils.folder.list.invalidate();
    void utils.article.feed.invalidate();
  };
  const add = api.source.add.useMutation({
    onSuccess: (s) => {
      toast.success(`Added ${s.name}`);
      setFeedUrl("");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const remove = api.source.remove.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });
  const move = api.source.move.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });
  const refresh = api.source.refresh.useMutation({
    onSuccess: (r) => {
      toast.success(`${r.created} new article${r.created === 1 ? "" : "s"}`);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const createFolder = api.folder.create.useMutation({
    onSuccess: (f) => {
      toast.success(`Created folder ${f.name}`);
      setNewFolder("");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const renameFolder = api.folder.rename.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });
  const removeFolder = api.folder.remove.useMutation({
    onSuccess: () => {
      if (addFolderId !== NONE) setAddFolderId(NONE);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const folderItems = useMemo(
    () => [
      { value: NONE, label: "No folder" },
      ...(folders.data?.map((f) => ({ value: f.id, label: f.name })) ?? []),
      { value: NEW, label: "New folder…" },
    ],
    [folders.data],
  );

  /** Prompt for a name and create the folder; resolves to its id or null. */
  const promptNewFolder = async (): Promise<string | null> => {
    const name = window.prompt("New folder name")?.trim();
    if (!name) return null;
    try {
      const f = await createFolder.mutateAsync({ name });
      return f.id;
    } catch {
      return null; // error already toasted by the mutation
    }
  };

  // Group sources: one bucket per folder (in folder order), then unfiled.
  const groups = useMemo(() => {
    const byFolder = new Map<string | null, SourceRow[]>();
    for (const s of sources.data ?? []) {
      const key = s.folderId ?? null;
      byFolder.set(key, [...(byFolder.get(key) ?? []), s]);
    }
    const out: { folder: FolderRow | null; sources: SourceRow[] }[] = [];
    for (const f of folders.data ?? [])
      out.push({ folder: f, sources: byFolder.get(f.id) ?? [] });
    const unfiled = byFolder.get(null) ?? [];
    if (unfiled.length || out.length === 0)
      out.push({ folder: null, sources: unfiled });
    return out;
  }, [sources.data, folders.data]);

  const hasFolders = (folders.data?.length ?? 0) > 0;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Rss data-icon="inline-start" /> Sources
        {sources.data && (
          <span className="text-muted-foreground ml-1 text-xs">
            ({sources.data.length})
          </span>
        )}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>RSS sources</SheetTitle>
            <SheetDescription>
              Feeds are polled when you open the app (if stale) and whenever
              you hit refresh. Group them into folders to filter the feed.
            </SheetDescription>
          </SheetHeader>

          <form
            className="space-y-2 border-b px-4 pb-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (feedUrl.trim())
                add.mutate({
                  feedUrl: feedUrl.trim(),
                  folderId: addFolderId === NONE ? null : addFolderId,
                });
            }}
          >
            <Label htmlFor="feedUrl">Add a feed</Label>
            <div className="flex gap-2">
              <Input
                id="feedUrl"
                type="url"
                placeholder="https://example.com/rss.xml"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                required
              />
              <Button type="submit" disabled={add.isPending}>
                <Plus
                  data-icon="inline-start"
                  className={add.isPending ? "animate-spin" : ""}
                />{" "}
                Add
              </Button>
            </div>
            <Select
              items={folderItems}
              value={addFolderId}
              onValueChange={(v) => {
                if (!v) return;
                if (v === NEW) {
                  void promptNewFolder().then((id) => id && setAddFolderId(id));
                  return;
                }
                setAddFolderId(String(v));
              }}
            >
              <SelectTrigger className="w-full" aria-label="Folder">
                <Folder className="text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folderItems.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>

          <form
            className="space-y-2 border-b px-4 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (newFolder.trim())
                createFolder.mutate({ name: newFolder.trim() });
            }}
          >
            <Label htmlFor="newFolder">New folder</Label>
            <div className="flex gap-2">
              <Input
                id="newFolder"
                placeholder="e.g. Tech, World, Business"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                maxLength={60}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={createFolder.isPending || !newFolder.trim()}
              >
                <FolderPlus data-icon="inline-start" /> Create
              </Button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto">
            {groups.map(({ folder, sources: list }) => (
              <section key={folder?.id ?? "unfiled"}>
                <FolderHeading
                  folder={folder}
                  count={list.length}
                  showLabel={hasFolders}
                  onRename={(name) =>
                    folder && renameFolder.mutate({ id: folder.id, name })
                  }
                  onRemove={() =>
                    folder &&
                    confirm(
                      `Delete folder "${folder.name}"? Its feeds will stay, just unfiled.`,
                    ) &&
                    removeFolder.mutate({ id: folder.id })
                  }
                />
                {list.length === 0 ? (
                  <p className="text-muted-foreground px-4 py-3 text-xs">
                    {folder
                      ? "No feeds in this folder yet."
                      : "No feeds yet — add one above."}
                  </p>
                ) : (
                  <ul className="divide-y">
                    {list.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{s.name}</div>
                          <div className="text-muted-foreground truncate text-xs">
                            {s.feedUrl}
                          </div>
                          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                            <span>{s._count.articles} articles</span>
                            <span>·</span>
                            <span>
                              {s.lastPolledAt
                                ? `polled ${timeAgo(s.lastPolledAt)}`
                                : "never polled"}
                            </span>
                            {s.lastError && (
                              <span
                                className="text-destructive inline-flex items-center gap-1"
                                title={s.lastError}
                              >
                                <AlertCircle className="size-3" /> error
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <Select
                              items={folderItems}
                              value={s.folderId ?? NONE}
                              onValueChange={(v) => {
                                if (v === NEW) {
                                  void promptNewFolder().then(
                                    (id) =>
                                      id &&
                                      move.mutate({ id: s.id, folderId: id }),
                                  );
                                  return;
                                }
                                const next = v === NONE ? null : String(v);
                                if (next !== (s.folderId ?? null))
                                  move.mutate({ id: s.id, folderId: next });
                              }}
                            >
                              <SelectTrigger
                                size="sm"
                                aria-label={`Folder for ${s.name}`}
                              >
                                <Folder className="text-muted-foreground" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {folderItems.map((f) => (
                                  <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => refresh.mutate({ id: s.id })}
                          disabled={refresh.isPending}
                          aria-label="Refresh"
                        >
                          <RefreshCw
                            className={
                              refresh.isPending &&
                              refresh.variables?.id === s.id
                                ? "animate-spin"
                                : ""
                            }
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            confirm(`Remove ${s.name} and its articles?`) &&
                            remove.mutate({ id: s.id })
                          }
                          aria-label="Remove"
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function FolderHeading({
  folder,
  count,
  showLabel,
  onRename,
  onRemove,
}: {
  folder: FolderRow | null;
  count: number;
  showLabel: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(folder?.name ?? "");

  if (!showLabel) return null;

  const commit = () => {
    const name = draft.trim();
    if (name && name !== folder?.name) onRename(name);
    setEditing(false);
  };

  return (
    <div className="bg-muted/40 text-muted-foreground sticky top-0 z-10 flex items-center gap-2 border-y px-4 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur">
      <Folder className="size-3.5" />
      {folder && editing ? (
        <form
          className="flex flex-1 items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraft(folder.name);
                setEditing(false);
              }
            }}
            maxLength={60}
            className="h-7 text-xs normal-case"
            aria-label="Folder name"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="Save name"
          >
            <Check />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel"
            onClick={() => {
              setDraft(folder.name);
              setEditing(false);
            }}
          >
            <X />
          </Button>
        </form>
      ) : (
        <>
          <span className="truncate">{folder?.name ?? "Unfiled"}</span>
          <span className="tabular-nums">({count})</span>
          {folder && (
            <span className="ml-auto flex items-center">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Rename folder"
                onClick={() => {
                  setDraft(folder.name);
                  setEditing(true);
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete folder"
                onClick={onRemove}
              >
                <Trash2 className="text-destructive" />
              </Button>
            </span>
          )}
        </>
      )}
    </div>
  );
}
