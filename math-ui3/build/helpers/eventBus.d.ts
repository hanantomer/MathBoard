export default function (): {
    emit: (event: string, ...args: any) => void;
    bus: import("vue").Ref<Map<any, any>>;
};
