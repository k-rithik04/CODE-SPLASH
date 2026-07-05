import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SchoolFormData {
  studentType: string;
  teamName: string;
  noOfMembers: string;
  school: string;
  schoolAddress: string;
  district: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  leaderName: string;
  leaderGrade: string;
  leaderEmail: string;
  leaderPhone: string;
  members: { name: string; grade: string; phone: string }[];
  technologies: string[];
  languages: string[];
  hackathonExp: string;
  hackathonDetails: string;
  problemSolved: string;
  problemsToSolve: string;
  analyticalSkills: string[];
  hearAbout: string;
  declaration: boolean;
}

interface SchoolFormState {
  step: number;
  isSubmitting: boolean;
  isSubmitted: boolean;
  visibleMemberCount: number;
  errorMsg: string | null;
  formData: SchoolFormData;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsSubmitting: (v: boolean) => void;
  setIsSubmitted: (v: boolean) => void;
  setVisibleMemberCount: (v: number) => void;
  setErrorMsg: (msg: string | null) => void;
  updateField: <K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) => void;
  updateMember: (index: number, field: keyof SchoolFormData["members"][0], value: string) => void;
  reset: () => void;
}

const INITIAL_FORM_DATA: SchoolFormData = {
  studentType: "Government",
  teamName: "",
  noOfMembers: "3",
  school: "",
  schoolAddress: "",
  district: "",
  teacherName: "",
  teacherEmail: "",
  teacherPhone: "",
  leaderName: "",
  leaderGrade: "",
  leaderEmail: "",
  leaderPhone: "",
  members: [
    { name: "", grade: "", phone: "" },
    { name: "", grade: "", phone: "" },
    { name: "", grade: "", phone: "" },
    { name: "", grade: "", phone: "" },
  ],
  technologies: [],
  languages: [],
  hackathonExp: "",
  hackathonDetails: "",
  problemSolved: "",
  problemsToSolve: "",
  analyticalSkills: [],
  hearAbout: "",
  declaration: false,
};

export const useSchoolFormStore = create<SchoolFormState>()(
  persist(
    (set) => ({
      step: 1,
      isSubmitting: false,
      isSubmitted: false,
      visibleMemberCount: 1,
      errorMsg: null,
      formData: { ...INITIAL_FORM_DATA },

      setStep: (step) => set({ step }),

      nextStep: () =>
        set((state) => ({
          step: state.step < 4 ? state.step + 1 : state.step,
        })),

      prevStep: () =>
        set((state) => ({
          step: state.step > 1 ? state.step - 1 : state.step,
          errorMsg: null,
        })),

      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setIsSubmitted: (isSubmitted) => set({ isSubmitted }),
      setVisibleMemberCount: (visibleMemberCount) => set({ visibleMemberCount }),
      setErrorMsg: (errorMsg) => set({ errorMsg }),

      updateField: (key, value) =>
        set((state) => ({
          formData: { ...state.formData, [key]: value },
          errorMsg: null,
        })),

      updateMember: (index, field, value) =>
        set((state) => {
          const members = [...state.formData.members];
          members[index] = { ...members[index], [field]: value };
          return { formData: { ...state.formData, members }, errorMsg: null };
        }),

      reset: () =>
        set({
          step: 1,
          isSubmitting: false,
          isSubmitted: false,
          visibleMemberCount: 1,
          errorMsg: null,
          formData: { ...INITIAL_FORM_DATA },
        }),
    }),
    {
      name: "school-form-data",
      partialize: (state) => ({
        step: state.step,
        formData: state.formData,
        visibleMemberCount: state.visibleMemberCount,
      }),
    }
  )
);
