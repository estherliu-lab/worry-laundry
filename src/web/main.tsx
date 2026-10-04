import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { LaundryGame, type ScrollProps, type SheetProps } from "../game/LaundryGame";
import "../prototype.css";
import "./web.css";
function WebScroll({ className, children }: ScrollProps) {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, []);
  return <div className={className}>{children}</div>;
}
function CollectionSheet({ open, onOpenChange, title, description, children }: SheetProps) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="web-dialog-overlay" /><Dialog.Content className="web-collection"><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description><Dialog.Close className="web-close" aria-label={document.documentElement.lang === "en" ? "Close dialog" : "关闭窗口"}><Cross2Icon /></Dialog.Close>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><LaundryGame Scroll={WebScroll} Sheet={CollectionSheet} web /></React.StrictMode>);
