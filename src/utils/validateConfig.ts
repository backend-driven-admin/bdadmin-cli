const fieldKeys = ["key", "type", "sort", "search"];
const validationKeys = ["key", "type", "min", "max", "required", "unique", "hidden", "disabled", "defaultValue", "regex", "dataSource"];
const allowedFieldBaseTypes = ["string", "hidden", "number", "boolean", "date", "array", "object", "audio", "video", "image", "token"];
const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function validateConfig(config: any): string | undefined {
    if (typeof config !== 'object' || config === null) {
        return "The config is not an object or empty";
    }

    if (!config.entities || !Array.isArray(config.entities) || config.entities?.length === 0) {
        return "The entities were not found";
    }

    if (!config.auth) {
        return "The authorization module was not found";
    }

    for (const entity of config.entities) {
        if (!entity.name) return "The name of the entity is not specified";
        if (!entity.endpoint || !entity.endpoint?.url || !entity.endpoint?.method) {
            return `Endpoint is not set for the entity ${entity.name}`
        }

        if (!methods.includes(entity.endpoint.method)) {
            return `Invalid value of the '${entity.name}' endpoint method`
        }

        if (!entity.fields || !Array.isArray(entity.fields)) {
            return `Fields is not set for the entity ${entity.name}`
        }

        for (const field of entity.fields) {
            if (!field.key) {
                return "The key of the entity field is not specified"
            }
            for (const key of Object.keys(field)) {
                if (!fieldKeys.includes(key)) {
                    return `The keys of the '${field.key}' field are not correct in ${entity.name}`;
                }
            }
            if (!allowedFieldBaseTypes.includes(field.type)) {
                return `Field '${field.key}' in entity '${entity.name}' has invalid type '${field.type}'`;
            }
        }

        if (entity.actions && Array.isArray(entity.actions)) {
            for (const action of entity.actions) {
                if (!action.endpoint || !action.endpoint?.url || !action.endpoint?.method) {
                    return "Endpoint is not set for the action"
                }

                if (!methods.includes(action.endpoint.method)) {
                    return `Invalid value of the '${action.endpoint.url}' endpoint method`
                }

                if (!action.fields || !Array.isArray(action.fields)) {
                    return "Fields is not set for the action";
                }

                for (const field of action.fields) {
                    if (!field.key) {
                        return "The key of the action field is not specified"
                    }
                    for (const key of Object.keys(field)) {
                        if (!validationKeys.includes(key)) {
                            return `The keys of the '${field.key}' field are not correct in ${action.endpoint.url}`;
                        }
                    }
                    if (!allowedFieldBaseTypes.includes(field.type)) {
                        return `Field '${field.key}' in action '${action.endpoint.url}' has invalid type '${field.type}'`;
                    }
                }
            }
        }
    }

    if (!config.auth?.settings?.accessKey || !config.auth?.settings?.refreshKey) {
        return 'The accessKey and refreshKey fields are not specified in the authorization module'
    }

    if (!config.auth.login) {
        return 'The login is not specified in the authorization module'
    }
    if (!config.auth.refresh) {
        return 'The refresh is not specified in the authorization module'
    }
    if (!config.auth.logout) {
        return 'The logout is not specified in the authorization module'
    }

    if (!config.auth.login.endpoint || !config.auth.login.endpoint?.url || !config.auth.login.endpoint?.method) {
        return "Endpoint is not set for the login"
    }

    if (!methods.includes(config.auth.login.endpoint.method)) {
        return 'Invalid value of the login endpoint method'
    }

    if (!config.auth.login.fields || !Array.isArray(config.auth.login.fields) || config.auth.login.fields.length === 0) {
        return 'Login fields are not set'
    }

    for (const field of config.auth.login.fields) {
        if (!field.key) {
            return "The key of the login field is not specified"
        }
        for (const key of Object.keys(field)) {
            if (!validationKeys.includes(key)) {
                return `The keys of the '${field.key}' field are not correct in login`;
            }
        }
        if (!allowedFieldBaseTypes.includes(field.type)) {
            return `Field '${field.key}' in login has invalid type '${field.type}'`;
        }
    }

    if (!config.auth.refresh.endpoint || !config.auth.refresh.endpoint?.url || !config.auth.refresh.endpoint?.method) {
        return "Endpoint is not set for the refresh"
    }

    if (!methods.includes(config.auth.refresh.endpoint.method)) {
        return 'Invalid value of the refresh endpoint method'
    }

    if (!config.auth.logout.endpoint || !config.auth.logout.endpoint?.url || !config.auth.logout.endpoint?.method) {
        return "Endpoint is not set for the logout"
    }

    if (!methods.includes(config.auth.logout.endpoint.method)) {
        return 'Invalid value of the logout endpoint method'
    }
}