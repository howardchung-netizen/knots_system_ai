import { useMutation } from "@apollo/client";
import { userResetPassword } from "../apollo/mutations";

export default () => {
    const [mutate, { data, loading, error }] = useMutation(userResetPassword, {
    });
    return [mutate, { data, loading, error }]
}