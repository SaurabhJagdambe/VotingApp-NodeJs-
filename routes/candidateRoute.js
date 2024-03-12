const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware } = require("../jwt");
const Candidate = require("../models/candidate");

//Checking Role of User
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    console.log(user);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "User does not have Admin role" });
    const data = req.body; // Assuming the request body contains the candidate data

    // Create a new User document using the Mongoose model
    const newCandidate = new Candidate(data);

    // Save the new user to the database
    const response = await newCandidate.save();
    console.log("Data saved successfully");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Update the Candidaite data by id
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "User does not have Admin role" });

    const candidateId = req.params.candidateId; //Extract id from URL
    const updatedcandidaiteData = req.body; //updated data for person

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedcandidaiteData,
      {
        new: true, // returns the updated document
        runValidators: true, // run mongoose validator
      }
    );
    if (!response) {
      return res.status(404).json({ error: " Candidate Not Found" });
    }
    console.log("data Updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

// Delete the Candidaite Data
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "User does not have Admin role" });

    const candidateId = req.params.candidateId; //Extract id from URL

    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ error: "Candidiate not Found" });
    }
    console.log(" Candidate data Deleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

// Lets start Voting
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  // user can only vote once

  candidateId = req.params.candidateId;
  userID = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "candidate not Found" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (user.isVoted) {
      return res.status(404).json({ message: "You have Alredy Given Vote" });
    }
    if (user.role === "admin") {
      return res.status(404).json({ message: "Admin is not allowed to vote" });
    }

    //update the candidaite document to record vote
    candidate.vote.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    //update the user document
    user.isVoted = true;
    await user.save();
    res.status(200).json({ message: " Vote Recorded Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

//vote count
router.get("/vote/count", async (req, res) => {
  try {
    // find all candidadate and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    //map the candidate to only return their name and votecount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

//List of all candidate name and party
router.get("/", async (req, res) => {
  try {
    // list of candidate with name and party , excluding id
    const candidates = await Candidate.find({}, "name party -_id"); // - represent exclude

    //Returns list of candidates
    return res.status(200).json(candidates);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

module.exports = router;
