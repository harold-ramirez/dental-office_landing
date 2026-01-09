interface Props {
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
}

export default function Modal(props: Props) {
  const { title, message, buttonText, onClose } = props;
  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-black/50">
      <div className="bg-slate-100 rounded-xl w-1/3 flex flex-col gap-5 items-center">
        <span className="flex font-semibold border-b w-full border-gray-400 p-2 flex-row justify-between items-center">
          <h2>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 cursor-pointer py-1"
          >
            X
          </button>
        </span>
        <p className="w-full px-2">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-blue-500 px-2 py-1 mb-2 text-slate-100 font-semibold w-1/2"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
