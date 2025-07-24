import { FooterLink, FooterLinkGroup } from "flowbite-react";
import { useTranslation } from 'react-i18next';
import { Typography } from "../../atom/typography";
  
  export function Footer() {
    const { t } = useTranslation();

    return (
      <footer className="bg-typo rounded-none">
        <div className="max-w-[90rem] w-full mx-auto px-4 py-8">
          <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
            <div>
              <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <img src='/logo-brin.png' className="h-[60px] w-auto" alt="BRIN Logo"/>
              </a>
              <div className="text-typo-white">
                <Typography type="heading5" weight="semibold">{t('kr')}</Typography>
                <Typography type="body" font="dm-sans" weight="regular">{t('pr')}</Typography>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-6">
                <div>
                  <FooterLinkGroup col className="text-typo-white">
                    <FooterLink href={t('routes.tentang')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('tentang')}</Typography>
                    </FooterLink>
                    <FooterLink href={t('routes.anggota')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('anggota')}</Typography>
                    </FooterLink>
                    <FooterLink href={t('routes.penelitian')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('penelitian')}</Typography>
                    </FooterLink>
                    <FooterLink href={t('routes.publikasi')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('publikasi')}</Typography>
                    </FooterLink>
                  </FooterLinkGroup>
                </div>
                <div>
                  <FooterLinkGroup col className="text-typo-white">
                    <FooterLink href={t('routes.kerjasama')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('n_mitra')}</Typography>
                    </FooterLink>
                    <FooterLink href={t('routes.materi')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('materi')}</Typography>
                    </FooterLink>
                    <FooterLink href={t('routes.kontak')}>
                      <Typography type="body" font="dm-sans" weight="regular">{t('kontak')}</Typography>
                    </FooterLink>
                  </FooterLinkGroup>
                </div>
              </div>
            </div>   
          </div>
        </div>
        <div className="pt-4 border-b border-typo-secondary"></div>
        <div className="max-w-[90rem] w-full mx-auto p-4">
          <div className="text-typo-white text-center w-full sm:flex sm:items-center sm:justify-center">
            <Typography type="caption1" font="dm-sans" weight="regular">
              {t('copyright')}
            </Typography>
          </div>
        </div>
      </footer>
    );
  }
  