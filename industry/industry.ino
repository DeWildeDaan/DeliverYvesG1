// Libraries
#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Ultrasonic
#define pin_h_trigger 27
#define pin_h_echo 26
#define pin_l_trigger 13
#define pin_l_echo 12
int ultrasonic_threshold = 0;
int ultrasonic_counter = 0;
int h_distance_detected = 0;
int l_distance_detected = 0;

// API
int h_distance_min;
int h_distance_max;
int h_distance_avg = 0;
int l_distance_min;
int l_distance_max;
int l_distance_avg = 0;
float weight_previous = 0;
float weight_post = 0;
float weight_differental = 0;
float distance_time;

String rack_id = "";
int rack_row = 2;
portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;
String sampleDataAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/sampledata";
String predictionAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/predict";
String restockAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/restock" + rack_id;
String rackIdAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/racks/" + rack_id;


// Wifi
WiFiManager wifiManager;
HTTPClient http;


// Timer
long timer_detection;
long timer_first = 0;
int timer_delay = 80;

// Misc
bool detection = false;
int selected = 0;



void setup() {
  Serial.begin(9600);
  
  wifiManager.setDebugOutput(true);
  std::vector<const char *> menu = {"wifi"};
  wifiManager.setMenu(menu);
  wifiManager.setHostname("DeliverYvesRek");
  wifiManager.autoConnect("DeliverYvesRek");
  rack_id = WiFi.macAddress();
  postRackId();
  
  pinMode(2, OUTPUT);
  pinMode(pin_h_trigger, OUTPUT);
  pinMode(pin_l_trigger, OUTPUT);
  pinMode(pin_h_echo, INPUT);
  pinMode(pin_l_echo, INPUT);

  startupSequence();

  gatheringSelected();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {  
    int h_distance;
    int l_distance;
    
    if (detection) {
      if (timer_first == 0) {
        timer_first = millis();
      }

      if (h_distance_detected != 0 && l_distance_detected != 0) {
        h_distance = h_distance_detected;
        l_distance = l_distance_detected;  

        h_distance_detected = 0;
        l_distance_detected = 0;
      } else {
        ultrasonicDistances(&h_distance, &l_distance);
      }
            
      if (h_distance != 0 && l_distance != 0) {
        timer_detection = millis();
        ultrasonic_counter += 1;  

        Serial.print(h_distance);
        Serial.print(" ");
        Serial.println(l_distance);
  
        h_distance_avg += h_distance;
        l_distance_avg += l_distance;
  
        if (h_distance_min == 0) {
          h_distance_min = h_distance; 
        } else if (h_distance < h_distance_min) {
          h_distance_min = h_distance; 
        }
        if (h_distance > h_distance_max) {
          h_distance_max = h_distance; 
        }
        if (l_distance_min == 0) {
          l_distance_min = l_distance; 
        } else if (l_distance < l_distance_min) {
          l_distance_min = l_distance; 
        }
        if (l_distance > l_distance_max) {
          l_distance_max = l_distance; 
        }
        
        
      } else if (ultrasonic_counter != 0) {
        if (millis() - timer_detection > 5000) {
          distance_time = millis() - timer_first - 5000;
          h_distance_avg = h_distance_avg / ultrasonic_counter;
          l_distance_avg = l_distance_avg / ultrasonic_counter;
          
          digitalWrite(2, LOW);
          detection = false;
//          timer_delay = 0;

          
          Serial.print("Counter ");
          Serial.println(ultrasonic_counter);
          Serial.print("Time ");
          Serial.println(distance_time);
          
          Serial.print("Distance avg ");
          Serial.print(h_distance_avg);
          Serial.print(" ");
          Serial.println(l_distance_avg);
//
          Serial.print("Distance min ");
          Serial.print(h_distance_min);
          Serial.print(" ");
          Serial.println(l_distance_min);

          Serial.print("Distance max ");
          Serial.print(h_distance_max);
          Serial.print(" ");
          Serial.println(l_distance_max);

          sendSampleData();
          
          Serial.println("Done");
          Serial.println("");

          dataClear();
          gatheringSelected();
         }  
      } else {
        if (millis() - timer_detection > 3000) {
          digitalWrite(2, LOW);
          detection = false;
        }
      }
    } else {
      ultrasonicDetection(&h_distance_detected, &l_distance_detected);  
    }
    delay(timer_delay);
  }
}


void gatheringSelected() {
  if (selected == 24) {
    selected = 1;  
  } else {
    selected++;  
  }

  Serial.print("Grab bottle: ");
  Serial.println(selected);
}

void dataClear() {
  h_distance_min = 0;
  h_distance_max = 0;
  h_distance_avg = 0;
  l_distance_min = 0;
  l_distance_max = 0;
  l_distance_avg = 0;
  weight_previous = 0;
  weight_post = 0;
  weight_differental = 0;
  distance_time = 0;

  timer_first = 0;
  ultrasonic_counter = 0;
}









void sendSampleData(){
  Serial.println(l_distance_avg);
  Serial.println(distance_time);
  
  http.begin(sampleDataAPI);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["RackId"] = rack_id;
  doc["RackRow"] = rack_row;
  doc["Label"] = selected;
  doc["WeightPre"] = weight_previous;
  doc["WeightPost"] = weight_post;
  doc["WeightDiff"] = weight_differental;
  doc["DistMinH"] = h_distance_min;
  doc["DistMaxH"] = h_distance_max;
  doc["DistAvgH"] = h_distance_avg;
  doc["DistMinL"] = l_distance_min;
  doc["DistMaxL"] = l_distance_max;
  doc["DistAvgL"] = l_distance_avg;
  doc["DistTime"] = distance_time;

  String requestBody;
  serializeJson(doc, requestBody);
  int httpResponseCode = http.POST(requestBody);
  http.end();
}

void postRackId(){
  if(WiFi.status()== WL_CONNECTED){
    http.begin(rackIdAPI);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["RackId"] = rack_id;
    
    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    http.end();
  }
}











void ultrasonicDistances(int *h_distance, int *l_distance) {
  int h_measurement = ultrasonicDistance(pin_h_trigger, pin_h_echo);
  int l_measurement = ultrasonicDistance(pin_l_trigger, pin_l_echo);

  if (h_measurement <= ultrasonic_threshold && l_measurement <= ultrasonic_threshold) {
    *h_distance = h_measurement;
    *l_distance = l_measurement;
    return;
  } else if (h_measurement <= ultrasonic_threshold) {
    *h_distance = h_measurement;
    *l_distance = h_measurement;
    return;
  } else if (l_measurement <= ultrasonic_threshold) {
    *h_distance = l_measurement;
    *l_distance = l_measurement;
    return;
  } else {
    *h_distance = 0;
    *l_distance = 0;
    return;
  }
}

void ultrasonicDetection(int *h_distance, int *l_distance) {
  int h;
  int l;
  ultrasonicDistances(&h, &l);

  if (h != 0 && l != 0) {
    *h_distance = h;
    *l_distance = l;
    
    detection = true;
    digitalWrite(2, HIGH);
    timer_delay = 80;
  }
}

void startupSequence() {
  for (int i = 0; i < 10; i++) {
    ultrasonic_threshold += ultrasonicDistance(pin_h_trigger, pin_h_echo);
    ultrasonic_threshold += ultrasonicDistance(pin_l_trigger, pin_l_echo);
    delay(20);
  }
  ultrasonic_threshold = (ultrasonic_threshold / 20) - 5;

  Serial.print("Threshold: ");
  Serial.println(ultrasonic_threshold);
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
