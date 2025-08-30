import Logo from '@/assets/images/logos/logoTransparente2.png';
const FullLogo = ({ withoutLink }: { withoutLink?: boolean }) => {

  if (withoutLink) {
    return (
      <img src={Logo.src} alt='logo' className='block' />
    );
  }

  return (
    <a href={'/'}>
      <img src={Logo.src} alt='logo' className='block' />
    </a>
  );
};

export default FullLogo;
