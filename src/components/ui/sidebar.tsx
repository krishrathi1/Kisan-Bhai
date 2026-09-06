"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight, ChevronLeft, ChevronRight } from "lucide-react";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  setState: React.Dispatch<React.SetStateAction<"expanded" | "collapsed">>;
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
  isExpanded: boolean;
};

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<"expanded" | "collapsed">(
    "collapsed"
  );
  const [isHovered, setIsHovered] = React.useState(false);

  // Automatically expanded whenever user hovers over it OR if manually pinned/expanded
  const isExpanded = state === "expanded" || isHovered;

  return (
    <SidebarContext.Provider
      value={{
        state,
        setState,
        isHovered,
        setIsHovered,
        isExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

const sidebarVariants = cva(
  "hidden lg:flex flex-col border-r bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out z-30 select-none",
  {
    variants: {
      isExpanded: {
        true: "w-64 shadow-xl border-r-primary/20",
        false: "w-[64px] shadow-none",
      },
    },
    defaultVariants: {
      isExpanded: false,
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const { setIsHovered, isExpanded } = useSidebar();
    const isMobile = useIsMobile();

    if (isMobile) return null;

    return (
      <div
        ref={ref}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        className={cn(sidebarVariants({ isExpanded }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isExpanded } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-[57px] items-center border-b px-3 transition-all duration-300",
        isExpanded ? "justify-between" : "justify-center",
        className
      )}
      {...props}
    >
      {isExpanded ? (
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
          Menu Navigation
        </span>
      ) : null}
      <SidebarTrigger />
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isExpanded } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        !isExpanded ? "overflow-x-hidden" : "",
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto p-4 transition-all duration-300", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { state, setState, isExpanded } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-primary transition-transform duration-200",
        className
      )}
      onClick={() =>
        setState(state === "expanded" ? "collapsed" : "expanded")
      }
      title={state === "expanded" ? "Pin Collapsed" : "Pin Expanded"}
      {...props}
    >
      {isExpanded ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex justify-end pr-3", className)} {...props} />
));
SidebarInset.displayName = "SidebarInset";

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
};
