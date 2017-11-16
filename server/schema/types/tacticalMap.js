export default `

type TacticalMap {
  id: ID
  name: String
  template: Boolean
  flight: Flight
  
  layers: [TacticalLayer]
  frozen: Boolean
}

type TacticalLayer {
  id: ID
  type: TACTICAL_TYPES
  
  #Item Options
  items: [TacticalItem]

  #Image Options
  image: String

  #Grid Options  
  color: String
  labels: Boolean
  gridCols: Int
  gridRows: Int
}

type TacticalItem {
  id: ID

  #Text
  label: String
  font: String
  fontSize: Float
  fontColor: String
  flash: Boolean

  #Icon
  icon: String  
  size: Float

  #Animation
  speed: Float
  velocity: Coordinates
  location: Coordinates
  destination: Coordinates

  #Keyboard Control
  wasd: Boolean
  ijkl: Boolean

}
enum TACTICAL_TYPES {
 grid
 image
 objects 
}`;
