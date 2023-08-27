const initialState = {
  todos: [
    {
      id: 'pesanlength',
      data: 0
    },
      {
      id: 'scanner',
      data: 0
    },
 
  ]
}
const todoReducer = (state = initialState, action) => {
  const { type, payload} = action;
  switch(type){
    case "ADD":
      return {
        ...state,
         todos: [  ...state.todos.filter(todo => todo.status !== 0)
          ,...state.todos.filter(todo => todo.status === 0).filter(todo => todo.makanan !== payload.makanan),payload]
       
      }
    case "DEL":
      return{
        ...state,
        todos: state.todos.filter(todo => todo.id_pesanan !== payload)
      }
    case "UP":
      return{
        ...state,
      
     
      todos: [  ...state.todos.filter(todo => todo.id !== payload.id),payload]
       
      }
        case "DELID":
      return{
        ...state,
      
     
        todos: state.todos.filter(todo => todo.id !== payload)
       
      }
    default:
      return {
        ...state
      }
  }
}
export default todoReducer;