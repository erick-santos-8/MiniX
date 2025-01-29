import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import ModeToggle from './ModeToggle';
import { Button } from './ui/button';
import { BellIcon, HomeIcon, UserIcon } from 'lucide-react';
import Link from "next/link";
import { SignInButton, UserButton } from '@clerk/nextjs';

const DesktopNavbar = async () => {
  const user = await currentUser();
  console.log("user: ", user);
  return (
    <div className='hidden md:flex items-center space-x-4'>
      <ModeToggle />

      <Button variant='ghost' className='flex items-center gap-2' asChild>
        <Link href='/'>
          <HomeIcon className='size-1' />
          <span className='hidden lg:inline'>Inicio</span>
        </Link>
      </Button>

      {
        user ? (
          <>
            <Button variant='ghost' className='flex items-center gap-2' asChild>
              <Link href='/notifications'>
                <BellIcon className='size-1' />
                <span className='hidden lg:inline'>Notificações</span>
              </Link>
            </Button>
            <Button variant='ghost' className='flex items-center gap-2' asChild>
              <Link href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split('@')[0]}`}>
                <UserIcon className='size-1' />
                <span className='hidden lg:inline'>Perfil</span>
              </Link>
            </Button>
            <UserButton />
          </>
        ) : (
          <SignInButton mode='modal'>
            <Button variant='default'>Entrar</Button>
          </SignInButton>
        )
      }
    </div>
  )
}

export default DesktopNavbar
