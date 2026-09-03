"use client";
export default function DashboardPageShell({children,title,description}:{children:React.ReactNode;title?:string;description?:string}){return <div className="min-h-full w-full bg-[#02070b] text-white">{title&&<div className="mb-5"><h1 className="text-xl font-semibold">{title}</h1>{description&&<p className="mt-1 text-xs text-slate-500">{description}</p>}</div>}{children}</div>;}
