'use client';

import { Check, Palette } from 'lucide-react';
import { useSkin } from '@/lib/skin/skin-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SkinSwitcher() {
  const { skinId, setSkin, skins } = useSkin();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Alterar aparência">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aparência</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {skins.map(skin => (
          <DropdownMenuItem
            key={skin.id}
            onClick={() => setSkin(skin.id)}
            className="flex cursor-pointer items-center gap-2"
          >
            <span>{skin.icon}</span>
            <span className="flex-1">{skin.name}</span>
            {skinId === skin.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
