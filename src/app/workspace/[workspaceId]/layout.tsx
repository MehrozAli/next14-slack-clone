"use client";

import { PropsWithChildren } from 'react';

import { Toolbar } from './_components/Toolbar';

const WorkspaceLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='h-full'>
      <Toolbar />
      
      {children}
    </div>
  )
}

export default WorkspaceLayout;
