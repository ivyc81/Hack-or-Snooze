const BASE_URL = "https://hack-or-snooze-v2.herokuapp.com";

/**
 * This class maintains the list of individual Story instances
 *  It also has some methods for fetching, adding, and removing stories
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }
  /**
   * This method is designed to be called to generate a new StoryList.
   *  It calls the API, builds an array of Story instances, makes a single StoryList
   * instance out of that, and then returns the StoryList instance
   */
  static async getStories() {
    // query the /stories endpoint (no auth required)
    const response = await $.getJSON(`${BASE_URL}/stories`);
    // turn the plain old story objects from the API into instances of the Story class
    const stories = response.stories.map(story => new Story(story));
    // build an instance of our own class using the new array of stories
    const storyList = new StoryList(stories)
    return storyList;
  }
  /**
     * Method to make a POST request to /stories and add the new story to the list
     The function should accept the current instance of User who will post the story
     It should also accept an object which with a title, author, and url
     */
  
  // _toggleAddRemove(user, story){
    
  // }

  async addStory(user, newStory) {
    // TODO - Implement this functions!
    // this function should return the newly created story so it can be used in the script.js file where it will be appended to the DOM
    const response = await $.post(`${BASE_URL}/stories`, {
      token: user.loginToken,
      story: {
        author: newStory.author,
        title: newStory.title,
        url: newStory.url
      }
    });

    const story = new Story(response.story);

    return story;
  }

  // remove a story from the storylist
  // takes care of the API call
  async removeStory(user, storyIDToRemove){
    const token = user.loginToken;

    let response = await $.ajax({
      url: `${BASE_URL}/stories/${storyIDToRemove}`,
      type: "DELETE",
      data: {token}
    });
    return response;
  }

}


/**
 * The User class to primarily represent the current user.
 *  There are helper methods to signup (create), login, and stayLoggedIn
 */
class User {
  constructor(userObj) {
    this.username = userObj.username;
    this.name = userObj.name;
    this.createdAt = userObj.createdAt;
    this.updatedAt = userObj.updatedAt;

    // these are all set to defaults, not passed in by the constructor
    this.loginToken = "";
    this.favorites = [];
    this.ownStories = [];
  }

  /*
   A class method to create a new user - it accepts a username, password and name
   It makes a POST request to the API and returns the newly created User as well as a token
   */
  static async create(username, password, name) {
    const response = await $.post(`${BASE_URL}/signup`, {
      user: {
        username,
        password,
        name
      }
    });
    // build a new User instance from the API response
    const newUser = new User(response.user);

    // attach the token to the newUser instance for convenience
    newUser.loginToken = response.token;

    // save the token to localStorage
    localStorage.setItem("token", response.token);

    // also save the username so that we don't have to decode the token to get it every time
    localStorage.setItem("username", newUser.username); 
    return newUser;
  }

  /*
   A class method to log in a user. It returns the user 
   */
  static async login(username, password) {
    const response = await $.post(`${BASE_URL}/login`, {
      user: {
        username,
        password
      }
    });
    // build a new User instance from the API response
    const existingUser = new User(response.user);

    // instantiate Story instances for the user's favorites and ownStories
    existingUser.favorites = response.user.favorites.map(story => new Story(story))
    existingUser.ownStories = response.user.stories.map(story => new Story(story));

    // attach the token to the newUser instance for convenience
    existingUser.loginToken = response.token;

    // save the token to localStorage
    localStorage.setItem("token", response.token);

    // also save the username so that we don't have to decode the token to get it every time
    localStorage.setItem("username", existingUser.username);

    return existingUser;
  }

  /**
   * This function grabs a token and username from localStorage.
   *  It uses the token & username to make an API request to get details
   *   about the user. Then it creates an instance of user with that inf function.
   */
  static async stayLoggedIn() {
    // get username and token from localStorage
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // call the API
    const response = await $.getJSON(`${BASE_URL}/users/${username}`, {
      token
    });
    // instantiate the user from the API information
    const existingUser = new User(response.user);

    // attach the token to the newUser instance for convenience
    existingUser.loginToken = token;

    // instantiate Story instances for the user's favorites and ownStories
    existingUser.favorites = response.user.favorites.map(
      story => new Story(story)
    );
    existingUser.ownStories = response.user.stories.map(
      story => new Story(story)
    );
    return existingUser;
  }

  // takes care of API calls
  async _toggleFavorite(storyId, toFavorite){
    let userName = this.username;
    let token = this.loginToken;
    let requestType;

    if(toFavorite){
      requestType = "POST"
    }
    else{
      requestType = "DELETE"
    }

    let response = await $.ajax({
      url: `${BASE_URL}/users/${userName}/favorites/${storyId}`,
      type: `${requestType}`,
      data: {token}
    });
  }

  async addFavorite(storyId){
    await this._toggleFavorite(storyId, true)
  }

  async removeFavorite(storyId){
    await this._toggleFavorite(storyId, false)
  }

  // check if story has been added to favorited
  checkFavorited(story){
    let favoritedStories = this.favorites;
    return favoritedStories.some(favorited => favorited.storyId === story.storyId);
  }

  // check if story is our own
  checkIfItsOwn(story){
    let ownStories = this.ownStories;
    return ownStories.some(own => own.storyId === story.storyId);
  }
  

}
/**
 * Class to represent a single story. Has one method to update.
 */
class Story {
  /*
   * The constructor is designed to take an object for better readability / flexibility
   */
  constructor(storyObj) {
    this.author = storyObj.author;
    this.title = storyObj.title;
    this.url = storyObj.url;
    this.username = storyObj.username;
    this.storyId = storyObj.storyId;
    this.createdAt = storyObj.createdAt;
    this.updatedAt = storyObj.updatedAt;
  }
}