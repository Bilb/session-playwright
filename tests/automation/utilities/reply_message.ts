import { Page } from '@playwright/test';
import { sendMessage } from './message';
import {
  clickOnMatchingText,
  clickOnTextMessage,
  waitForTextMessage,
} from './utils';
import { sleepFor } from '../../promise_utils';
import { englishStrippedStr } from '../../locale/localizedString';

/**
 * Reply to a message and optionally wait for the reply to be received.
 * @param senderWindow send the message from this window
 * @param textMessage look for this message in senderWindow to reply to it
 * @param replyText reply with this message
 * @param receiverWindow if set, will wait until replyText is received from senderWindow
 *
 * Note: Most of the case, we want a receiverWindow argument to be given, to make the tests as reliable as possible
 */
export const replyTo = async ({
  replyText,
  textMessage,
  receiverWindow,
  senderWindow,
}: {
  senderWindow: Page;
  textMessage: string;
  replyText: string;
  receiverWindow: Page | null;
}) => {
  await waitForTextMessage(senderWindow, textMessage);
  // the right click context menu, for some reasons, often doesn't show up on the first try. Let's loop a few times

  for (let index = 0; index < 5; index++) {
    try {
      await clickOnTextMessage(senderWindow, textMessage, true, 1000);
      // those 2 sleepfor are to try to avoid the layout shift which happens when we click too fast in the context menu
      await sleepFor(200, true);

      await clickOnMatchingText(
        senderWindow,
        englishStrippedStr('reply').toString(),
        false,
        1000,
      );
      await sleepFor(200, true);

      break;
    } catch (e) {
      console.info(
        `failed to right click & reply to message attempt: ${index}.`,
      );
      await sleepFor(500, true);
    }
  }
  await sendMessage(senderWindow, replyText);
  if (receiverWindow) {
    await waitForTextMessage(receiverWindow, replyText);
  }
};
