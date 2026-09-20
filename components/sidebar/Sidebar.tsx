"use client";

import { useState } from "react";
import NavItem from "./NavItem";
import AboutModal from "@/components/modals/AboutModal";
import ContactModal from "@/components/modals/ContactModal";
import { DashboardIcon, AboutIcon, ContactIcon } from "./icons";

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 200;

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="absolute left-0 top-0 z-20 flex h-full flex-col border-r border-[#00D4FF1A] bg-[#0A1520CC] backdrop-blur-sm transition-[width] duration-300 ease-out"
        style={{ width }}
      >
        <div className="flex flex-col gap-1 p-2 pt-4">
          <NavItem icon={<DashboardIcon />} label="Dashboard" expanded={expanded} active />
          <NavItem icon={<AboutIcon />} label="About" expanded={expanded} onClick={() => setAboutOpen(true)} />
          <NavItem icon={<ContactIcon />} label="Contact" expanded={expanded} onClick={() => setContactOpen(true)} />
        </div>
      </aside>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}
