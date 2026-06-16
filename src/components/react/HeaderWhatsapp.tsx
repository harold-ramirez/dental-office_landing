import { useEffect, useMemo, useState } from 'react';
import { usePhoneNumber } from './PhoneNumberProvider';
import { WhatsappIcon } from './icons/WhatsappIcon';

export function HeaderWhatsapp() {
  const { phoneNumber, isLoading } = usePhoneNumber();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const message = 'Buenos días Doctor, vengo de su página web';

  const whatsappUrl = useMemo(() => {
    if (!phoneNumber) return '';
    return `https://wa.me/591${phoneNumber}?text=${encodeURIComponent(message)}`;
  }, [phoneNumber]);

  const qrUrl = useMemo(() => {
    if (!whatsappUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(whatsappUrl)}`;
  }, [whatsappUrl]);

  const isMobileDevice = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    const userAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const smallScreen = window.matchMedia('(max-width: 768px)').matches;

    return userAgent || (coarsePointer && smallScreen);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    document.body.style.overflow = 'hidden';

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', onEscape);
    };
  }, [isModalOpen]);

  const onWhatsAppClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobileDevice()) {
      event.preventDefault();
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        title="Cargando WhatsApp..."
        className="flex items-center gap-2 bg-gray-400 opacity-50 shadow-sm px-4 py-2 rounded-lg font-semibold text-white text-base transition-all duration-300 cursor-not-allowed"
      >
        <WhatsappIcon className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
    );
  }

  if (!phoneNumber) {
    return (
      <button
        type="button"
        disabled
        title="WhatsApp no disponible"
        className="flex items-center gap-2 bg-gray-400 opacity-50 shadow-sm px-4 py-2 rounded-lg font-semibold text-white text-base transition-all duration-300 cursor-not-allowed"
      >
        <WhatsappIcon className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
    );
  }

  return (
    <>
      <a
        target="_blank"
        rel="noopener noreferrer"
        title="Contactar por WhatsApp"
        href={whatsappUrl}
        onClick={onWhatsAppClick}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl px-4 py-2 rounded-lg font-semibold text-white text-base transition-all duration-300"
      >
        <WhatsappIcon className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {isModalOpen && (
        <div className="z-9999 fixed inset-0 flex justify-center items-center bg-black/60 px-4">
          <div className="bg-white shadow-2xl p-6 rounded-2xl w-full max-w-sm">
            <div className="flex justify-end items-start gap-4 mb-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-gray-100 p-1 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Cerrar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <img
              src={qrUrl}
              alt="QR para abrir conversación de WhatsApp"
              className="mx-auto mb-5 border border-gray-200 rounded-lg w-64 h-64"
              loading="lazy"
            />

            <h3 className="font-bold text-gray-900 text-xl text-center">
              Mándanos WhatsApp
            </h3>
            <p className="mb-4 text-gray-600 text-center">
              Escanea el código QR para hablar con nosotros desde tu celular.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-500 hover:bg-green-600 px-4 py-3 rounded-lg w-full font-semibold text-white text-center transition-colors"
            >
              O abre WhatsApp en esta PC
            </a>
          </div>
        </div>
      )}
    </>
  );
}
