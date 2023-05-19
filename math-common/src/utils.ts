function capitalize(str: string) : string {
  return str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : str;
}

export {capitalize}
