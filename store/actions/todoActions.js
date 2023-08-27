export const addTodo = data => {
  return({
    type: "ADD",
    payload: data
  })
}
export const UpdateTodo = data => {
  return({
    type: "UP",
    payload: data
  })
}
export const deleteById = data => {
  return({
    type: "DELID",
    payload: data
  })
}
export const delTodo = data => {
  return({
    type: "DEL",
    payload: data
  })
}