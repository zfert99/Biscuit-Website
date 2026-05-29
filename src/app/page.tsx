import TopNav from "@/components/TopNav";
import HeroPlaceholder from "@/components/HeroPlaceholder";
import SidebarPlaceholder from "@/components/SidebarPlaceholder";
import ArcadeMatrix from "@/components/ArcadeMatrix";
import FooterControls from "@/components/FooterControls";

export default function HomePage() {
  return (
    <div id="portal-root">
      <TopNav />
      <HeroPlaceholder />
      <SidebarPlaceholder />
      <ArcadeMatrix />
      <FooterControls />
    </div>
  );
}
