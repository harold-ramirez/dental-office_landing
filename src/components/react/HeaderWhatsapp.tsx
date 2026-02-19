import { usePhoneNumber } from "./PhoneNumberProvider";
import WhatsappIcon from "@icons/Whatsapp.astro";

export function HeaderWhatsapp() {
  const { phoneNumber, isLoading } = usePhoneNumber();

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        title="Cargando WhatsApp..."
        className="flex items-center gap-2 bg-gray-400 cursor-not-allowed opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-sm text-base"
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
        className="flex items-center gap-2 bg-gray-400 cursor-not-allowed opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-sm text-base"
      >
        <WhatsappIcon className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
    );
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      title="Contactar por WhatsApp"
      href={`https://wa.me/591${phoneNumber}?text=${encodeURIComponent("Buenos días doctor, vengo de su página web")}`}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-base"
    >
      <WhatsappIcon className="w-5 h-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
