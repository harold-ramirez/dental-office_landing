import { useState } from "react";
import Calendar from "./Calendar";
import Form from "./Form";

export default function RequestFormWrapper() {
  const [selectedDate, setSelectedDate] = useState<string>("");

  return (
    <>
      <Calendar
        className="lg:col-span-8 col-span-12 order-2 lg:order-1"
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
      <Form
        className="lg:col-span-4 col-span-12 order-1 lg:order-2"
        selectedDate={selectedDate}
        onClearSelected={() => setSelectedDate("")}
      />
    </>
  );
}
