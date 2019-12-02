/*
 Copyright 2017 Yan Li

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/** The list of languages this extension is translated into */

const FILE_SIZE_MULTIPLIER = {
  B:   Math.pow(1024, 0),
  KiB: Math.pow(1024, 1),
  MiB: Math.pow(1024, 2),
  GiB: Math.pow(1024, 3),
  TiB: Math.pow(1024, 4),
  PiB: Math.pow(1024, 5),
  EiB: Math.pow(1024, 6),
  ZiB: Math.pow(1024, 7),
  YiB: Math.pow(1024, 8)
};