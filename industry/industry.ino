#define pin_h_trigger 27
#define pin_h_echo 26
#define pin_l_trigger 13
#define pin_l_echo 12

int ultrasonic_threshold = 0;
int ultrasonic_previous = 0;
int ultrasonic_counter = 0;

int h_distance_min;
int h_distance_max;
int h_distance_avg;
int l_distance_min;
int l_distance_max;
int l_distance_avg;

bool detection = false;

long timer_detection;

void setup() {
  Serial.begin(9600);
  pinMode(2, OUTPUT);
  pinMode(pin_h_trigger, OUTPUT);
  pinMode(pin_l_trigger, OUTPUT);
  pinMode(pin_h_echo, INPUT);
  pinMode(pin_l_echo, INPUT);

  startupSequence();
}

void loop() {
  int h_distance;
  int l_distance;

  ultrasonicDetection();
  if (detection) {
    ultrasonicDistances(&h_distance, &l_distance);
    if (h_distance != 0 && l_distance != 0) {
      timer_detection = millis();
      ultrasonic_counter += 1;  

      
    } else {
      if (millis() - timer_detection > 5000) {
        digitalWrite(2, LOW);
        detection = false;
      }  
    }
  }
  delay(400);
}

void ultrasonicDistances(int *h_distance, int *l_distance) {
  int h_measurement = ultrasonicDistance(pin_h_trigger, pin_h_echo);
  int l_measurement = ultrasonicDistance(pin_l_trigger, pin_l_echo);

  if (h_measurement < ultrasonic_threshold && l_measurement < ultrasonic_threshold) {
    *h_distance = h_measurement;
    *l_distance = l_measurement;
    return;
  } else if (h_measurement < ultrasonic_threshold) {
    *h_distance = h_measurement;
    *l_distance = h_measurement;
    return;
  } else if (l_measurement < ultrasonic_threshold) {
    *h_distance = l_measurement;
    *l_distance = l_measurement;
    return;
  } else {
    *h_distance = 0;
    *l_distance = 0;
    return;
  }
}









void ultrasonicDetection() {
  int h_distance = ultrasonicDistance(pin_h_trigger, pin_h_echo);
  int l_distance = ultrasonicDistance(pin_l_trigger, pin_l_echo);

  if (h_distance < ultrasonic_threshold || l_distance < ultrasonic_threshold) {
    detection = true;
    digitalWrite(2, HIGH);
  }
}

void startupSequence() {
  for (int i = 0; i < 10; i++) {
    ultrasonic_threshold += ultrasonicDistance(pin_h_trigger, pin_h_echo);
    ultrasonic_threshold += ultrasonicDistance(pin_l_trigger, pin_l_echo);
    delay(20);
  }
  ultrasonic_threshold = (ultrasonic_threshold / 20) - 5;
  ultrasonic_previous = ultrasonic_threshold;
}

int ultrasonicDistance(int pin_trigger, int pin_echo) {
  digitalWrite(pin_trigger, LOW);
  delayMicroseconds(2);
  digitalWrite(pin_trigger, HIGH);
  delayMicroseconds(10);
  digitalWrite(pin_trigger, LOW);

  int duration = pulseIn(pin_echo, HIGH);
  int distance = duration * 0.017;
  delay(50);
  return distance;
}
