export default function axiosHelper(): {
    baseURL: string;
    initAxiosInterceptors: () => void;
    handleError: (error: any) => any;
};
