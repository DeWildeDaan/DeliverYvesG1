// Libraries
#include <HX711.h>

// Ultrasonic High
#define pin_h_trigger 12
#define pin_h_echo 13

// Ultrasonic Low
#define pin_l_trigger 27
#define pin_l_echo 26

// Weight sensors
#define pin_data 33
#define pin_clk 32
HX711 scale;


void setup() {
  Serial.begin(9600);

  pinMode(pin_h_trigger, OUTPUT);
  pinMode(pin_l_trigger, OUTPUT);
  pinMode(pin_h_echo, INPUT);
  pinMode(pin_l_echo, INPUT);
}

void loop() {
  int distance_h = ultrasonicDistances(pin_h_trigger, pin_h_echo);
  Serial.println(distance_h);
}

int ultrasonicDistanceH(int pin_trigger, int pin_echo){
  digitalWrite(pin_trigger, LOW);
  delayMicroseconds(2);
  digitalWrite(pin_trigger, HIGH);
  delayMicroseconds(10);
  digitalWrite(pin_trigger, LOW);

  int duration = pulseIn(pin_echo, HIGH);
  int distance = duration * 0.017;
  return distance;
}
