"use client";

import { useState } from "react";
import NavItem from "./NavItem";
import LayerControlsPanel from "./LayerControlsPanel";
import {
  DashboardIcon,
  ProjectsIcon,
  TechStackIcon,
  AboutIcon,
  ContactIcon,
  LayersIcon,
} from "./icons";

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 200;

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="absolute left-0 top-0 z-20 flex h-full flex-col justify-between border-r border-[#00D4FF1A] bg-[#0A1520CC] backdrop-blur-sm transition-[width] duration-300 ease-out"
        style={{ width }}
      >
        <div className="flex flex-col gap-1 p-2 pt-4">
          <NavItem icon={<DashboardIcon />} label="Dashboard" expanded={expanded} active />
          <NavItem icon={<ProjectsIcon />} label="Projects" expanded={expanded} />
          <NavItem icon={<TechStackIcon />} label="Tech Stack" expanded={expanded} />
          <NavItem icon={<AboutIcon />} label="About" expanded={expanded} />
          <NavItem icon={<ContactIcon />} label="Contact" expanded={expanded} />
        </div>
        <div className="p-2 pb-4">
          <NavItem
            icon={<LayersIcon />}
            label="Layers"
            expanded={expanded}
            active={layersOpen}
            onClick={() => setLayersOpen((v) => !v)}
          />
        </div>
      </aside>
      <LayerControlsPanel open={layersOpen} anchorLeft={width + 12} />
    </>
  );
}
