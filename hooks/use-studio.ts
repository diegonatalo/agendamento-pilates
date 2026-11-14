import { createLocalStore } from "@/hooks/local-store";
import { useLocalStore } from "@/hooks/use-local-store";
import { newId } from "@/lib/ids";
import { sortSlots, validateNewSlot } from "@/lib/slots";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { removeSlotFromStudents, sortStudents } from "@/lib/students";
import type { ClassSlot, Student } from "@/types/pilates";

const slotsStore = createLocalStore<ClassSlot[]>(STORAGE_KEYS.slots, []);
const studentsStore = createLocalStore<Student[]>(STORAGE_KEYS.students, []);

/** Horários, alunos e as operações que mantêm os dois coerentes. */
export const useStudio = () => {
  const slotsState = useLocalStore(slotsStore);
  const studentsState = useLocalStore(studentsStore);
  const slots = sortSlots(slotsState.data);
  const students = sortStudents(studentsState.data);

  /** Devolve a mensagem de erro, ou `null` quando adicionou. */
  const addSlot = (candidate: Pick<ClassSlot, "weekday" | "startTime">) => {
    const error = validateNewSlot(candidate, slotsState.data);
    if (error) return error;
    slotsStore.set([...slotsState.data, { id: newId(), ...candidate }]);
    return null;
  };

  const removeSlot = (slotId: string) => {
    slotsStore.set(slotsState.data.filter((slot) => slot.id !== slotId));
    studentsStore.set(removeSlotFromStudents(studentsState.data, slotId));
  };

  const saveStudent = (student: Student) => {
    const exists = studentsState.data.some((s) => s.id === student.id);
    studentsStore.set(
      exists
        ? studentsState.data.map((s) => (s.id === student.id ? student : s))
        : [...studentsState.data, student],
    );
  };

  const removeStudent = (studentId: string) =>
    studentsStore.set(studentsState.data.filter((s) => s.id !== studentId));

  return {
    ready: slotsState.ready && studentsState.ready,
    slots,
    students,
    addSlot,
    removeSlot,
    saveStudent,
    removeStudent,
  };
};
