"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";

import { cn } from "~/lib/utils";

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

/** Select-style trigger button (the search input lives inside the popup). */
function ComboboxTrigger({
  className,
  size = "default",
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props & { size?: "sm" | "default" }) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      data-size={size}
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8 data-[size=sm]:h-7 *:data-[slot=combobox-value]:line-clamp-1 *:data-[slot=combobox-value]:flex *:data-[slot=combobox-value]:items-center *:data-[slot=combobox-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      className={cn(
        "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-3 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <XIcon />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative isolate z-50 flex max-h-(--available-height) w-(--anchor-width) min-w-64 origin-(--transform-origin) flex-col overflow-hidden rounded-lg shadow-md ring-1 duration-100",
            className,
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <div className="flex items-center gap-2 border-b px-2.5">
      <SearchIcon className="text-muted-foreground size-4 shrink-0" />
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        className={cn(
          "placeholder:text-muted-foreground h-9 w-full bg-transparent text-sm outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "scroll-my-1 overflow-y-auto p-1 data-[empty]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground px-2.5 py-4 text-center text-sm empty:hidden",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
};
