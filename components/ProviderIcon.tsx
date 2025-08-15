import Image from 'next/image';

interface ProviderIconProps {
  provider: string;
  className?: string;
  size?: number;
}

export const ProviderIcon = ({ provider, className = "", size = 16 }: ProviderIconProps) => {
  const getProviderIcon = (provider: string) => {
    const providerLower = provider.toLowerCase();
    
    switch (providerLower) {
      case 'google':
        return '/images/cs2dle/icons/google.svg';
      case 'discord':
        return '/images/cs2dle/icons/discord.svg';
      case 'steam':
        return '/images/cs2dle/icons/steam.svg';
      default:
        return null;
    }
  };

  const iconSrc = getProviderIcon(provider);

  if (!iconSrc) {
    return null;
  }

  return (
    <Image
      src={iconSrc}
      alt={`${provider} icon`}
      width={size}
      height={size}
      className={className}
    />
  );
};
