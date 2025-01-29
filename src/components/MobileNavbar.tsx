"use client";

import { SignInButton, SignOutButton, useAuth } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import React, { useState } from 'react'
import { Button } from './ui/button';
import { BellIcon, HomeIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import Link from 'next/link';

const MobileNavbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  return (
    <div className='flex md:hidden items-center space-x-2'>
      <Button variant='ghost' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='mr-2'>
        <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
        <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
        <span className='sr-only'>Tema</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon'>
            <MenuIcon className='h-5 w-5' />
          </Button>
        </SheetTrigger>
        <SheetContent side='right' className='w-[300px]'>
          <SheetHeader>
            <SheetTitle>
              Menu
            </SheetTitle>
          </SheetHeader>
          <nav className='flex flex-col space-y-4 mt-6'>
            <Button variant='ghost' className='flex items-center gap-3 justify-start' asChild>
              <Link href='/'>
                <HomeIcon className='size-1' />
                Inicio
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button variant='ghost' className='flex items-center gap-3 justify-start' asChild>
                  <Link href='/notifications'>
                    <BellIcon className='size-1' />
                    Notificações
                  </Link>
                </Button>
                <Button variant='ghost' className='flex items-center gap-3 justify-start' asChild>
                  <Link href='/profile'>
                    <UserIcon className='size-1' />
                    Perfil
                  </Link>
                </Button>
                <SignOutButton>
                  <Button variant='ghost' className='flex items-center gap-3 justify-start w-full'>
                    <LogOutIcon className='size-1' />
                    Sair
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode='modal'>
                <Button variant='default' className='w-full'>
                  Entrar
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileNavbar
