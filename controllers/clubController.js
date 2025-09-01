const { ClubhouseQueries } = require("../db/queries");

function computeAuthorName(msg, role) {
  if (!msg.author_id) {
    return "Deleted User";
  }
  if (role === "guest") {
    return "Anonymous";
  }
  return msg.author_username;
}

async function roomsList(req, res) {
  try {
    const rooms = await ClubhouseQueries.findAllRooms();
    const joinedRoomIds = await ClubhouseQueries.findJoinedRoomIds(req.user.id);

    res.render("layout/noSidebarLayout", {
      title: "Clubhouse Rooms",
      content: {
        type: "roomsList",
        rooms,
        joinedRoomIds,
        userRole: req.user.role,
        userId: req.user.id,
      },
    });
  } catch (err) {
    console.error(`Error in roomsList: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function roomDetail(req, res) {
  const { roomId } = req.params;

  try {
    const room = await ClubhouseQueries.findRoomById(roomId);
    if (!room) {
      return res.status(404).render("layout/noSidebarLayout", {
        title: "Room Not Found",
        content: {
          type: "messageOnly",
          message: {
            text: "As is written in heading. No such room.",
            actions: [
              { href: "/clubhouse/rooms", label: "Clubhouse" },
              { href: "/tasks", label: "tasks" },
            ],
          },
        },
      });
    }

    if (req.user.role === "guest" && room.title !== "global") {
      return res.render("layout/noSidebarLayout", {
        title: "Access Denied",
        content: {
          type: "messageOnly",
          message: {
            text: "Guests cannot enter this room. Only 'global' is accessible.",
            actions: [
              { href: "/auth/login", label: "Login" },
              { href: "/clubhouse/rooms", label: "Rooms" },
            ],
          },
        },
      });
    }

    const messages = await ClubhouseQueries.getMessagesByRoom(roomId);
    const processedMessages = messages.map((msg) => ({
      ...msg,
      authorName: computeAuthorName(msg, req.user.role),
      canDelete:
        req.user.role === "admin" ||
        room.owner_id === req.user.id ||
        msg.author_id === req.user.id,
    }));

    const isMember = await ClubhouseQueries.isUserMemberOfRoom({
      userId: req.user.id,
      roomId,
    });
    res.render("layout/noSidebarLayout", {
      title: room.title,
      content: {
        type: "roomDetail",
        room,
        processedMessages,
        userRole: req.user.role,
        userId: req.user.id,
        isMember,
      },
    });
  } catch (err) {
    console.error(`Error in roomDetail: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
          actions: [],
        },
      },
    });
  }
}

async function roomCreateGet(req, res) {
  res.render("layout/noSidebarLayout", {
    title: "Create Room",
    content: {
      type: "roomForm",
      editRoomForm: false,
    },
  });
}

async function roomCreatePost(req, res) {
  try {
    const { title, description } = req.body;
    const room = await ClubhouseQueries.newRoom({
      title,
      description,
      ownerId: req.user.id,
    });
    await ClubhouseQueries.addMembership({
      userId: req.user.id,
      roomId: room.id,
    });
    res.redirect(`/clubhouse/rooms/${room.id}`);
  } catch (err) {
    console.error(`Error in roomCreate: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function roomEditGet(req, res) {
  try {
    const { roomId } = req.params;
    const room = await ClubhouseQueries.findRoomById(roomId);

    if (!room) {
      return res.status(404).render("layout/noSidebarLayout", {
        title: "Room Not Found",
        content: {
          type: "messageOnly",
          message: { text: "No such room exists.", actions: [] },
        },
      });
    }

    const canEditRoom =
      req.user.role === "admin" || room.owner_id === req.user.id;
    if (canEditRoom) {
      res.render("layout/noSidebarLayout", {
        title: "Edit Room",
        content: {
          type: "roomForm",
          editRoomForm: true,
          room,
        },
      });
    } else {
      return res.render("layout/noSidebarLayout", {
        title: "Access Denied",
        content: {
          type: "messageOnly",
          message: {
            text: "You don't have the required authority to perform this action.",
            actions: [],
          },
        },
      });
    }
  } catch (err) {
    console.error(`Error in roomEditGet: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function roomEditPost(req, res) {
  try {
    const { title, description } = req.body;
    const { roomId } = req.params;

    await ClubhouseQueries.editRoom({ roomId, title, description });
    res.redirect(`/clubhouse/rooms/${roomId}`);
  } catch (err) {
    console.error(`Error in roomEditPost: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function roomJoin(req, res) {
  try {
    const { roomId } = req.params;
    const room = await ClubhouseQueries.findRoomById(roomId);

    if (!room) {
      return res.status(404).render("layout/noSidebarLayout", {
        title: "Room Not Found",
        content: {
          type: "messageOnly",
          message: { text: "No such room exists." },
        },
      });
    }

    if (req.user.role === "guest" && room.title !== "global") {
      return res.render("layout/noSidebarLayout", {
        title: "Access Denied",
        content: {
          type: "messageOnly",
          message: {
            text: "Guests cannot join this room. Only 'global' is accessible.",
          },
        },
      });
    }

    const isMember = await ClubhouseQueries.isUserMemberOfRoom({
      userId: req.user.id,
      roomId,
    });
    if (isMember) {
      return res.render("layout/noSidebarLayout", {
        title: "Redundant Action",
        content: {
          type: "messageOnly",
          message: {
            text: "User already a part of the Room.",
          },
        },
      });
    }

    await ClubhouseQueries.addMembership({ userId: req.user.id, roomId });
    res.redirect(`/clubhouse/rooms/${roomId}`);
  } catch (err) {
    console.error(`Error in roomJoin: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function roomLeave(req, res) {
  try {
    const { roomId } = req.params;
    const room = await ClubhouseQueries.findRoomById(roomId);

    if (!room) {
      return res.status(404).render("layout/noSidebarLayout", {
        title: "Room Not Found",
        content: {
          type: "messageOnly",
          message: { text: "No such room exists." },
        },
      });
    }

    if (room.owner_id === req.user.id) {
      return res.render("layout/noSidebarLayout", {
        title: "Action Not Allowed",
        content: {
          type: "messageOnly",
          message: {
            text: "Owners cannot leave their own room. Delete it instead.",
          },
        },
      });
    }

    const isMember = await ClubhouseQueries.isUserMemberOfRoom({
      userId: req.user.id,
      roomId,
    });
    if (!isMember) {
      return res.render("layout/noSidebarLayout", {
        title: "Redundant Action",
        content: {
          type: "messageOnly",
          message: {
            text: `User not a part of ${room.title} room.`,
          },
        },
      });
    }

    await ClubhouseQueries.removeMembership({ userId: req.user.id, roomId });
    res.redirect(`/clubhouse/rooms/${roomId}`);
  } catch (err) {
    console.error(`Error in roomLeave: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function roomDelete(req, res) {
  try {
    const { roomId } = req.params;
    await ClubhouseQueries.deleteRoom(roomId);
    res.redirect("/clubhouse/rooms");
  } catch (err) {
    console.error(`Error in roomDelete: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function messageCreate(req, res) {
  try {
    const { roomId } = req.params;
    const room = await ClubhouseQueries.findRoomById(roomId);

    const { content } = req.body;
    if (req.user.role === "guest" && room.title !== "global") {
      return res.render("layout/noSidebarLayout", {
        title: "Forbidden",
        content: {
          type: "messageOnly",
          message: {
            text: "Guests cannot send message in this room. Only global is accessible.",
            actions: [],
          },
        },
      });
    }

    const isMember = await ClubhouseQueries.isUserMemberOfRoom({
      userId: req.user.id,
      roomId,
    });
    if (!isMember) {
      return res.status(403).render("layout/noSidebarLayout", {
        title: "Forbidden",
        content: {
          type: "messageOnly",
          message: { text: "You must join this room to send messages." },
        },
      });
    }

    await ClubhouseQueries.newMessage({
      content,
      authorId: req.user.id,
      roomId,
    });
    res.redirect(`/clubhouse/rooms/${roomId}`);
  } catch (err) {
    console.error(`Error in messageCreate: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

async function messageDelete(req, res) {
  try {
    const { msgId, roomId } = req.params;
    await ClubhouseQueries.deleteMessage(msgId);
    res.redirect(`/clubhouse/rooms/${roomId}`);
  } catch (err) {
    console.error(`Error in messageDelete: ${err}`);
    res.status(500).render("layout/noSidebarLayout", {
      title: "Server Error",
      content: {
        type: "messageOnly",
        message: {
          text: "Please try again. If the issue persists, please inform creator.",
        },
      },
    });
  }
}

module.exports = {
  roomsList,
  roomDetail,
  roomCreateGet,
  roomCreatePost,
  roomEditGet,
  roomEditPost,
  roomJoin,
  roomLeave,
  roomDelete,
  messageCreate,
  messageDelete,
};
