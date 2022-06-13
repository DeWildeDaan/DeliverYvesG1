#include <WiFi.h>
#include <HX711_ADC.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Ultrasonic
#define pin_h_trigger 27
#define pin_h_echo 26
#define pin_l_trigger 33
#define pin_l_echo 32
int ultrasonic_threshold = 0;
int ultrasonic_counter = 0;
int h_distance_detected = 0;
int l_distance_detected = 0;

// HX711
#define pin_hx711_dout 21
#define pin_hx711_sck 22
HX711_ADC loadCell(pin_hx711_dout, pin_hx711_sck);
float prevReading = 0;
int sum = 0;

// API
int h_distance_min;
int h_distance_max;
int h_distance_avg = 0;
int l_distance_min;
int l_distance_max;
int l_distance_avg = 0;
float distance_time;
String rack_id = "";
int rack_row = 3;
portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;
String predictionAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/predict";
String restockAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/restock/";
String rackIdAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/racks/" + rack_id;

// Wifi
WiFiManager wifiManager;
HTTPClient http;

// Timer
long timer_detection;
long timer_hx711 = 0;
long timer_first = 0;
int timer_delay = 50;

// Misc
#define restock_pin 15
bool detection = false;
bool restocked = false;
int selected = 0;


void setup() {
  Serial.begin(9600);
  pinMode(2, OUTPUT);
  pinMode(pin_h_trigger, OUTPUT);
  pinMode(pin_l_trigger, OUTPUT);
  pinMode(pin_h_echo, INPUT);
  pinMode(pin_l_echo, INPUT);
  pinMode(restock_pin, INPUT);

  loadCell.begin();
  loadCell.start(2000, true);

  rack_id = WiFi.macAddress();

  wifiManager.setDebugOutput(true);
  std::vector<const char *> menu = {"wifi"};
  wifiManager.setMenu(menu);
  wifiManager.setHostname("DeliverYvesRek");
  wifiManager.autoConnect("DeliverYvesRek");
  
  postRackId();
  restockAPI = restockAPI + rack_id;

  startupSequence();
}

void loop() {
  int restock = digitalRead(restock_pin);
  if (WiFi.status() == WL_CONNECTED) {  
    if (restock == LOW) {
      if (restocked == true) {
        restocked = false;
      }
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
          Serial.println(h_distance);
          timer_detection = millis();
          ultrasonic_counter += 1;  
          
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
          if (millis() - timer_detection > 1000) {
            float reading = readScale();
                          Serial.println(prevReading);
                          Serial.println(reading);

            float diff = prevReading - reading;
                          Serial.println(diff);
                          Serial.println("---------");

    if(diff < -20.0){
                  prevReading = reading;

      sum++;
    } else {
      prevReading = reading;
    }
          }
          if (millis() - timer_detection > 5000) {
            distance_time = millis() - timer_first - 5000;
            h_distance_avg = h_distance_avg / ultrasonic_counter;
            l_distance_avg = l_distance_avg / ultrasonic_counter;
            
            digitalWrite(2, LOW);
            detection = false;
            Serial.println(sum);
            if (sum >= 10) {
                postData();
                Serial.println("Post");
                sum = 0;
            }
            
            dataClear();
            Serial.println("Clear");
           }  
        } else {
          if (millis() - timer_detection > 5000) {
            digitalWrite(2, LOW);
            detection = false;
          }
        }
      } else {
        ultrasonicDetection(&h_distance_detected, &l_distance_detected);  
      }
    } else {
      digitalWrite(2, HIGH);
      if (restocked == false) {
        postRestock();
        //calibrate();
        restocked = true;
      }
      delay(600);
      digitalWrite(2, LOW);
    }
    delay(timer_delay);
  }
}

unsigned long t = 0;

float readScale(){
  static boolean newDataReady = 0;
  const int serialPrintInterval = 0;
  if (loadCell.update()) newDataReady = true;
  if (newDataReady) {
    if (millis() > t + serialPrintInterval) {
      float i = loadCell.getData();
      newDataReady = 0;
      t = millis();
      return abs(i);
    }
  }
}

void dataClear() {
  h_distance_min = 0;
  h_distance_max = 0;
  h_distance_avg = 0;
  l_distance_min = 0;
  l_distance_max = 0;
  l_distance_avg = 0;
  distance_time = 0;

  timer_first = 0;
  ultrasonic_counter = 0;
}

void postData(){
      http.begin(predictionAPI);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<512> doc;
      doc["RackId"] = rack_id;
      doc["Row"] = rack_row;
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

void postRestock() {
  if(WiFi.status()== WL_CONNECTED){
    http.begin(restockAPI);
    Serial.println(restockAPI);
    int httpResponseCode = http.GET();
    http.end();
    Serial.println(httpResponseCode);
    Serial.println("Restock done");
  } 
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
    calibrate();
  }
}

void calibrate() {
  if (loadCell.getTareTimeoutFlag() || loadCell.getSignalTimeoutFlag()) {
    while (1);
  } else {
    loadCell.setCalFactor(10.0);
  }
  while (!loadCell.update());
  loadCell.tareNoDelay();
  loadCell.refreshDataSet();
  loadCell.getNewCalibration(10.0);
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
  int threshold_h = 0;
  int threshold_l = 0;
  while (threshold_h == 0 && threshold_l == 0) {
    threshold_h = ultrasonicDistance(pin_h_trigger, pin_h_echo);
    threshold_l = ultrasonicDistance(pin_l_trigger, pin_l_echo);
    delay(80);
  }
  ultrasonic_threshold = ((threshold_h + threshold_l) / 2) - 5;
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
