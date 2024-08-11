// 当Web应用被访问时，返回相应的HTML页面
function doGet(e) {
  if (e.parameter.page == "playback") {
    return HtmlService.createHtmlOutputFromFile('Playback')
      .setTitle('Video Playback');
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Video Capture');
}

// 存储从客户端发送的视频数据块
function storeVideoChunk(base64data) {
  const cache = CacheService.getScriptCache();
  const chunkKey = 'videoChunk_' + new Date().getTime() + '_' + Math.random().toString(36).substring(7);
  cache.put(chunkKey, base64data, 21600); // 存储6小时
  
  // 更新块索引
  const indexKey = 'videoChunkIndex';
  let index = cache.get(indexKey);
  index = index ? JSON.parse(index) : [];
  index.push(chunkKey);
  cache.put(indexKey, JSON.stringify(index), 21600);
}

// 获取所有视频块并按时间顺序排序
function getSortedVideoChunks() {
  const cache = CacheService.getScriptCache();
  const indexKey = 'videoChunkIndex';
  let index = cache.get(indexKey);
  
  if (!index) {
    return [];
  }
  
  index = JSON.parse(index);
  const chunks = cache.getAll(index);
  
  // 按时间戳排序
  const sortedChunks = Object.entries(chunks)
    .sort(([keyA], [keyB]) => {
      const timeA = keyA.split('_')[1];
      const timeB = keyB.split('_')[1];
      return timeA - timeB;
    })
    .map(([, value]) => value);
  
  return sortedChunks;
}

// 清除所有存储的视频数据块
function clearVideoChunks() {
  const cache = CacheService.getScriptCache();
  const indexKey = 'videoChunkIndex';
  let index = cache.get(indexKey);
  
  if (index) {
    index = JSON.parse(index);
    cache.removeAll(index);
    cache.remove(indexKey);
  }
  
  return "All video chunks cleared";
}

// 获取当前存储的视频数据块数量
function getChunkCount() {
  const cache = CacheService.getScriptCache();
  const indexKey = 'videoChunkIndex';
  let index = cache.get(indexKey);
  
  if (!index) {
    return 0;
  }
  
  return JSON.parse(index).length;
}
