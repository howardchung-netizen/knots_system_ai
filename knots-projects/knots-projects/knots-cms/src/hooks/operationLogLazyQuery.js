import { useLazyQuery } from "@apollo/client";
import { operationLogQuery } from "../apollo/queries";

export default () => {
    const [query, { data, loading, error, refetch }] = useLazyQuery(operationLogQuery, {
        fetchPolicy: "cache-first"
    });
    return [query, { data, loading, error, refetch }]
}