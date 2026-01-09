import { useEffect, useState, useMemo, useRef } from "react";
import Modal from "./Modal";
import { io, type Socket } from "socket.io-client";

interface Props {
  className?: string;
  selectedDate?: string;
  onClearSelected: () => void;
}

export default function (props: Props) {
  const socketRef = useRef<Socket | null>(null);
  const { className, selectedDate } = props;
  const [modal, setModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    buttonText: "",
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

  const connectSocket = (api: string, timeout = 5000): Promise<Socket> =>
    new Promise((resolve, reject) => {
      const s = io(api, {
        autoConnect: true,
        transports: ["websocket", "polling"],
      });
      const t = setTimeout(() => {
        s.disconnect();
        reject(new Error("Timeout connecting to socket"));
      }, timeout);

      const cleanup = () => {
        clearTimeout(t);
        s.off("connect");
        s.off("connect_error");
      };

      s.on("connect", () => {
        cleanup();
        resolve(s);
      });

      s.on("connect_error", (err: any) => {
        cleanup();
        s.disconnect();
        reject(err);
      });
    });

  // limpio al desmontar si quedó una conexión persistente
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

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

    let socket = socketRef.current;
    let createdForThisEmit = false;

    try {
      if (!socket || !socket.connected) {
        // conectar solo para este envío (o reutilizar si ya existe)
        socket = await connectSocket(api);
        socketRef.current = socket;
        createdForThisEmit = true;
      }

      // emitir el objeto directamente; usar ack para respuesta del servidor
      await new Promise<void>((resolve, reject) => {
        // timeout por si no responde el servidor
        const ackTimeout = setTimeout(() => {
          reject(new Error("No ack from server"));
        }, 5000);

        socket!.emit("onNewRequest", formData, (response: any) => {
          clearTimeout(ackTimeout);
          console.log("Servidor confirmó:", response);
          resolve();
        });
      });
      // limpiar form y mostrar modal de éxito
      setFormData({
        patientFullName: "",
        dateHourRequest: "",
        phoneNumber: "",
        message: "",
      });
      props.onClearSelected && props.onClearSelected();
      setErrorMessage(false);
      setModalConfig({
        title: "Éxito",
        message: "Su cita ha sido reservada!",
        buttonText: "Aceptar",
      });
      // const res = await fetch(`${apiUrl}/appointment-requests`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (res.ok) {
      //   setFormData({
      //     patientFullName: "",
      //     dateHourRequest: "",
      //     phoneNumber: "",
      //     message: "",
      //   });
      //   setErrorMessage(false);
      //   setModalConfig({
      //     title: "Exito",
      //     message: "Su cita ha sido reservada!",
      //     buttonText: "Aceptar",
      //   });
      // } else {
      //   setModalConfig({
      //     title: "Oh oh",
      //     message: "Algo salió mal, por favor intente de nuevo",
      //     buttonText: "Aceptar",
      //   });
      // }
    } catch (error) {
      console.error("Error:", error);
      setModalConfig({
        title: "Oh oh",
        message: "Algo salió mal, por favor intente de nuevo",
        buttonText: "Aceptar",
      });
    } finally {
      setModal(true);
      // si la conexión fue creada sólo para este emit, desconectarla
      if (createdForThisEmit && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
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
          onClose={() => setModal(false)}
        />
      )}
    </>
  );
}
