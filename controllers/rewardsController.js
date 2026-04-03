const fs = require('fs').promises;
const path = require('path');

const REWARDS_PATH = path.join(__dirname, '../data', 'user_rewards.json');

async function readRewards() {
  try {
    const data = await fs.readFile(REWARDS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rewards:', error);
    return {};
  }
}

exports.getUserRewards = async (req, res) => {
  const data = await readRewards();
  res.json(data.user);
};

exports.getPointsHistory = async (req, res) => {
  const data = await readRewards();
  res.json(data.history);
};

exports.getUserMissions = async (req, res) => {
  const data = await readRewards();
  res.json(data.missions);
};

exports.getAvailableRewards = async (req, res) => {
  const data = await readRewards();
  res.json(data.availableRewards);
};
