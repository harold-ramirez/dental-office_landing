import { usePhoneNumber } from "./PhoneNumberProvider";
import PhoneIcon from "@icons/Phone.astro";

export function LocationPhone() {
  const { phoneNumber, isLoading } = usePhoneNumber();

  if (isLoading) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 border border-gray-200 rounded-xl opacity-70">
          <PhoneIcon className="w-6 h-6 text-gray-400 mb-2" />
          <span className="font-bold text-gray-600">Contáctanos</span>
          <span className="text-sm text-gray-400">Cargando...</span>
        </div>
      </>
    );
  }

  if (!phoneNumber) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 border border-gray-200 rounded-xl opacity-70 cursor-not-allowed">
          <PhoneIcon className="w-6 h-6 text-gray-400 mb-2" />
          <span className="font-bold text-gray-600">Contáctanos</span>
          <span className="text-sm text-gray-400">No disponible</span>
        </div>
      </>
    );
  }

  return (
    <>
      <a
        href={`https://wa.me/591${phoneNumber}?text=${encodeURIComponent("Buenos días doctor, vengo de su página web")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-green-400 transition-all group/phone"
      >
        <PhoneIcon className="w-6 h-6 text-green-500 mb-2 group-hover/phone:scale-110 transition-transform" />
        <span className="font-bold text-gray-800">Contáctanos</span>
        <span className="text-sm text-gray-500">+591 {phoneNumber}</span>
      </a>
    </>
  );
}
