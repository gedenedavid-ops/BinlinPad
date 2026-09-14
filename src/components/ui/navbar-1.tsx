"use client" 

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { name: "Accueil", href: "#" },
    { name: "Fonctionnalités", href: "#features" },
    { name: "À propos", href: "#" },
  ];

  return (
    <div className="flex justify-center w-full py-6 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--bp-surface)] rounded-full shadow-lg w-full max-w-3xl relative z-10 border border-[var(--bp-border)]">
        <div className="flex items-center">
          <motion.div
            className="w-10 h-10 mr-6 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/logo3d.svg"
              alt="Logo BinlinPad"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
        
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link href={item.href} className="text-sm text-[var(--bp-text)] hover:text-[var(--color-ochre)] transition-colors font-medium">
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/connexion"
            className="text-[var(--bp-text)] font-medium hover:text-[var(--color-ochre)] transition-colors text-sm"
          >
            Se connecter
          </Link>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              href="/auth/connexion"
              className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-[var(--color-ochre)] rounded-full hover:bg-[var(--color-ochre-dark)] transition-colors"
            >
              Commencer
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-[var(--bp-text)]" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-[var(--bp-bg)] z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-[var(--bp-text)]" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link href={item.href} className="text-xl text-[var(--bp-text)] font-medium" onClick={toggleMenu}>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link href="/auth/connexion" className="text-xl text-[var(--color-ochre)] font-medium" onClick={toggleMenu}>
                    Se connecter
                  </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <Link
                  href="/auth/connexion"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-[var(--color-ochre)] rounded-full hover:bg-[var(--color-ochre-dark)] transition-colors"
                  onClick={toggleMenu}
                >
                  Commencer
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
