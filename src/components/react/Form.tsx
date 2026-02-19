import { useEffect, useState, useMemo } from "react";
import Modal from "./Modal";

interface Props {
  className?: string;
  selectedDate?: string;
  onClearSelected: () => void;
}

export default function (props: Props) {
  const { className, selectedDate } = props;
  const [modal, setModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    buttonText: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    buttonText: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    patientFullName: "",
    dateHourRequest: selectedDate ?? "",
    phoneNumber: "",
    message: "",
  });

  // formatea ISO a un string legible en español
  const formattedDateDisplay = useMemo(() => {
    const iso = formData.dateHourRequest || selectedDate;
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // fallback
    const fmt = d.toLocaleString("es-BO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return fmt.charAt(0).toUpperCase() + fmt.slice(1); // capitalizar
  }, [formData.dateHourRequest, selectedDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formData.patientFullName.trim() === "" ||
      formData.dateHourRequest.trim() === "" ||
      formData.phoneNumber.trim().length < 8 ||
      formData.message.trim() === ""
    ) {
      setErrorMessage(true);
      return;
    }

    const raw = (import.meta as any).env?.PUBLIC_API_URL ?? "";
    const api =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `http://${raw}`;

    const baseUrl = api.endsWith("/") ? api.slice(0, -1) : api;

    try {
      const response = await fetch(`${baseUrl}/appointment-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let msg = "Algo salió mal, por favor intente de nuevo";
        if (response.status === 409) {
           const errData = await response.json().catch(() => ({}));
           if (errData.message === 'Slot not available') {
              msg = "El horario seleccionado ya no está disponible. Por favor seleccione otro.";
           } else if (errData.message === 'Request already exists for this slot') {
              msg = "Ya existe una solicitud pendiente para este horario.";
           } else {
              msg = "Conflicto en la reserva. Intente otro horario.";
           }
        }
        throw new Error(msg);
      }

      // limpiar form y mostrar modal de éxito
      setFormData({
        patientFullName: "",
        dateHourRequest: "",
        phoneNumber: "",
        message: "",
      });
      console.log("Success, clearing form");
      props.onClearSelected && props.onClearSelected();
      setErrorMessage(false);
      setModalConfig({
        title: "Éxito",
        message: "Su cita ha sido reservada! Si existiera algún cambio, el doctor se pondrá en contacto con usted mediante WhatsApp. Gracias por su preferencia!",
        buttonText: "Aceptar",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setModalConfig({
        title: "No se pudo reservar",
        message: error.message || "Algo salió mal, por favor intente de nuevo",
        buttonText: "Entendido",
        type: "error",
      });
    } finally {
      setModal(true);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, dateHourRequest: selectedDate }));
    }
  }, [selectedDate]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2 ${className}`}
      >
        <h3 className="font-semibold text-xl">Llena tus Datos</h3>
        {/* Patient's name */}
        <label className="flex flex-col w-full">
          Nombre Completo del Paciente
          <input
            type="text"
            placeholder="Ej. Juan Perez"
            value={formData.patientFullName}
            onChange={(e) =>
              setFormData({ ...formData, patientFullName: e.target.value })
            }
            className="bg-slate-100 px-4 py-2 border border-gray-400 rounded-lg"
          />
        </label>
        {/* Phone Number */}
        <label className="flex flex-col w-full">
          Número de celular (con Whatsapp)
          <div className="flex flex-row bg-slate-100 border border-gray-400 rounded-lg overflow-hidden">
            <p className="flex items-center bg-gray-300 px-4 border-gray-400 border-r-2">
              +591
            </p>
            <input
              type="text"
              placeholder="Ej. 1234567"
              maxLength={8}
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="px-4 py-2 w-full"
            />
          </div>
        </label>
        {/* Message */}
        <label className="flex flex-col w-full">
          Explica tus síntomas
          <textarea
            placeholder="Describe brevemente el motivo de tu consulta..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="bg-slate-100 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-28 min-h-24 overflow-y-auto transition-shadow duration-200 resize-y placeholder-gray-500"
          />
        </label>
        {/* Date Hour Request */}
        <label className="flex flex-col w-full">
          Fecha/Hora deseada de consulta
          <input
            readOnly
            type="text"
            placeholder="Seleccione una hora en el calendario"
            value={formattedDateDisplay}
            aria-label="Fecha y hora seleccionada"
            className="bg-slate-100 px-4 py-2 border border-gray-400 rounded-lg text-center"
          />
        </label>

        <span
          className={`text-center text-red-500 ${
            errorMessage ? `block` : `hidden`
          }`}
        >
          Por favor llene todos los campos antes de continuar
        </span>

        <button
          type="submit"
          className="bg-blue-400 hover:bg-blue-500 mt-4 py-2 rounded-lg text-white transition-colors duration-500 cursor-pointer"
        >
          Reservar Cita
        </button>
      </form>
      {modal && (
        <Modal
          title={modalConfig.title}
          message={modalConfig.message}
          buttonText={modalConfig.buttonText}
          type={modalConfig.type}
          onClose={() => setModal(false)}
        />
      )}
    </>
  );
}
