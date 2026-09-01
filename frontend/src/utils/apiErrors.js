export function getApiErrors(detail, fieldMap = {}) {
  if (!Array.isArray(detail)) {
    return { fieldErrors: {}, generalError: typeof detail === 'string' ? detail : 'Ocurrió un error inesperado' }
  }

  const fieldErrors = {}
  const generalMessages = []

  detail.forEach((error) => {
    const backendField = error.loc?.at(-1)
    const frontendField = fieldMap[backendField]
    const message = String(error.msg || 'Valor inválido').replace(/^Value error,\s*/i, '')

    if (frontendField) {
      fieldErrors[frontendField] = message
    } else {
      generalMessages.push(message)
    }
  })

  return {
    fieldErrors,
    generalError: generalMessages.join('. ')
  }
}
