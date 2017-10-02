#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import requests
import sys
import json
import time
import re
from random import randint
from pprint import pformat, pprint

RAFIKI_BASE_URL = 'http://localhost:3000/v1'
CONNECTOR_URL = 'https://api.recast.ai/connect/v1'
VALID_ICON = '\033[92m✔\033[0m'
FAIL_ICON = '\033[91m❌\033[0m'

parser = argparse.ArgumentParser(description="Test my bot from a JSON file describing the expected answers in a conversation flow.")
parser.add_argument('file', type=str)
parser.add_argument('-c', '--conversation', type=str, default=None)
args = parser.parse_args()
file = args.file
conversation = args.conversation


""" ============ UTILS ============ """

def display_help():
  msg = """
Test my bot from a JSON file describing the expected answers in a conversation flow.

An example of a valid file:
{
  "token": "979a8e8c21a22032e657dbe7129fbf11",
  "mode": "old_builder",
  "conversations": [

    // My great pizza booking stuff
    {
      "title": "Pizza booking conversation",
      "messages": [
        {
          "user": "Give me pizza",
          "bot": ["What kind of pizza do you want ? We have Margherita and Formaggi"]
        },
        {
          "user": "i think i lik formagi more",
          "bot": ["Great :)", "Do you want extra parmigiano ?"]
        },
        {
          "user": "yeah",
          "bot": ["Nice, come by by 7 pm, we'll be waiting for you."]
        }
      ]
    }

  ]
}

The 'token' field must be a developer token.
The 'mode' field must be 'old_builder' or 'new_builder'
Optional 'wait_time' field : useful for 'old_builder', specify the number of seconds we give the bot to answer all messages. Default: 3
The 'conversations' field is an array of conversations

- Conversation : A conversation flow to test
  . has a 'title'
  . has an array of 'messages'

- Message : An input -> output mapping
  . has a 'user' field, which is a message sent by the user
  . has a 'bot' field, which is a list of messages sent in response by the bot

Message format :
  Can be a simple string, like : "Hello !"
  Can be a message in gromit's format, like : { "type": "picture", "content": "https://goo.gl/ywPX19" }
  In the 'bot' field, can be an array of messages. It means that the response must be one of the messages in the array
  In the 'bot' field, can be '"*"' or contain '*'. It means that anything will be matched

You can write comments with '//', nothing else than a comment can be on the line

\033[93mTo see a more complete example of a JSON file, run "./test_my_bot.py example"\033[0m
  """
  print(re.sub(r'\'(.*?)\'', r'\033[94m\1\033[0m', msg))


def display_example():
  msg = """
{
  "token": "979a8e8c21a22032e657dbe7129fbf11",
  "mode": "old_builder",
  "conversations": [

    {
      "title": "Hello conversation",
      "messages": [
        {
          "user": "Hello !",
          "bot": ["Hi there :)"]
        },
        {
          "user": "How are you doing ?",
          "bot": ["Fine thanks", "And you ?"]
        }
      ]
    },

    {
      "title": "Random picture conversation",
      "messages": [
        {
          "user": "Can I haz a cat plz ?",
          "bot": [{ "type": "picture", "content": "https://goo.gl/ywPX19" }]
        },
        {
          "user": { "type": "picture", "content": "https://goo.gl/VmsmzA" },
          "bot": ["Here is a similar picture :", { "type": "picture", "content": "https://goo.gl/VmsmzA" }]
        }
      ]
    },

    {
      "title": "Carousel and * conversation",
      "messages": [
        {
          "user": "return-carousel",

          "bot": [
            {
              "type": "carousel",
              "content": [
                {
                  "title": "Title 1",
                  "imageUrl": "none",
                  "buttons": "*"
                },
                "*"
              ]
            }
          ]

        }
      ]
    },

    {
      "title": "Random response conversation",
      "messages": [
        {
          "user": "hello",
          "bot": [["hi :)", "hello there", "welcome"], "How are you doing ?"]
        }
      ]
    },

    {
      "title": "Any response conversation",
      "messages": [
        {
          "user": "hello",
          "bot": ["*"]
        }
      ]
    },
  ]
}
"""
  print(msg)


def fatal_error(msg):
  print('\033[91m' + msg + '\033[0m')
  sys.exit(1)


def first_diff_index(str1, str2):
  for i in range(len(str1)):
    if i >= len(str2):
      return i
    if str1[i] != str2[i]:
      return i
  return len(str1)


def fail_conversation(expected_msgs, actual_msgs, mismatch):
  for i,expected in enumerate(expected_msgs):
    for x,msg in enumerate(expected):
      if msg['type'] == 'text':
        expected[x] = msg['content']
    if len(expected) == 1:
      expected_msgs[i] = expected[0]
  if len(expected_msgs) == 1:
    expected_msgs = expected_msgs[0]
  raw_lines = json.dumps(expected_msgs, indent=2, sort_keys=True, ensure_ascii=False).split('\n')
  string1 = '\n        '.join(raw_lines)
  if len(raw_lines) > 1:
    string1 = '\n        ' + string1

  for i,msg in enumerate(actual_msgs):
    if msg['type'] == 'text':
      actual_msgs[i] = msg['content']
  if len(actual_msgs) == 1:
    actual_msgs = actual_msgs[0]
  raw_lines = json.dumps(actual_msgs, indent=2, sort_keys=True, ensure_ascii=False).split('\n')
  string2 = '\n        '.join(raw_lines)
  if len(raw_lines) > 1:
    string2 = '\n        ' + string2

  sys.stdout.write('    - expected : \033[93m')
  print(string1)
  sys.stdout.write('\033[0m    - received : \033[91m')
  print(string2 + '\033[0m')
  if type(mismatch) is str:
    print('    {}'.format(mismatch))
  else:
    print('    \033[93m{}\033[0m'.format(mismatch[0]))
    print('    \033[91m{}\033[0m'.format(mismatch[1]))
    print('    {}^'.format(first_diff_index(mismatch[0], mismatch[1]) * ' '))


generated_strings = set()
def random_string():
  string = None
  while not string or string in generated_strings:
    string = str(randint(0, 100000000))
  generated_strings.add(string)
  return string


def messages_match(expected, actual):
  if expected == '*':
    return True, []
  if type(expected) is not type(actual):
    if type(expected) is list:
      return False, 'Expected multiple messages but received only one'
    return False, 'Expected a \033[93m{}\033[0m but received a \033[91m{}\033[0m'.format(type(expected), type(actual))

  if type(expected) is list:
    if len(expected) != len(actual):
      return False, ['list-length', len(expected), len(actual)]
    for i in range(len(expected)):
      exp = expected[i]
      act = actual[i]
      ok,mismatch = messages_match(exp, act)
      if not ok:
        if mismatch[0] == 'list-length':
          mismatch = 'Wrong number of elements in a list, expected \033[93m{}\033[0m but got \033[91m{}\033[0m'.format(mismatch[1], mismatch[2])
        return False, mismatch
  elif type(expected) is dict:
    if len(expected.keys()) != len(actual.keys()):
      return False, 'Wrong number of keys in an object, expected \033[93m{}\033[0m but got \033[91m{}\033[0m'.format(len(expected.keys()), len(actual.keys()))
    for exp_k,exp_v in expected.items():
      if exp_k not in actual:
        return False, 'Key \'{}\' missing'.format(exp_k)
      act_v = actual[exp_k]
      ok,mismatch = messages_match(exp_v, act_v)
      if not ok:
        if mismatch[0] == 'list-length':
          mismatch = 'Key \'{}\', expected a list of \033[93m{}\033[0m elements but got \033[91m{}\033[0m'.format(exp_k, mismatch[1], mismatch[2])
        return False, mismatch
  else:
    res = expected == actual
    mismatch = [] if res else [json.dumps(expected, ensure_ascii=False), json.dumps(actual, ensure_ascii=False)]
    return res, mismatch
  return True, ''


def select_conversation(conversations, conversation):
  if not conversation:
    return conversations
  found = False
  for conv in conversations:
    if conv['title'] == conversation:
      conversations = [conv]
      found = True
      break
  if not found:
    fatal_error('Could not find conversation \'{}\''.format(conversation))
  return conversations

""" ============ END UTILS ============ """


""" ============ INPUT SYNTAX VALIDATION ============ """

def parse_first_level(file):
  try:
    file = open(file, 'r')
  except FileNotFoundError:
    fatal_error('File not found : {}'.format(file))
  file_content = file.read()
  # remove comments
  file_content = re.sub(r'\n\s*?//[^\n]*', '\n', file_content)
  try:
    file_content = json.loads(file_content)
  except json.decoder.JSONDecodeError as e:
    fatal_error('JSON file syntax error : ' + str(e))
  if 'token' not in file_content:
    fatal_error('Missing \'token\' field')
  if type(file_content['token']) is not str:
    fatal_error('Field \'token\' must be a string')
  if 'conversations' not in file_content:
    fatal_error('Missing \'conversations\' field')
  if type(file_content['conversations']) is not list:
    fatal_error('Field \'conversations\' must be a list')
  mode = 'new_builder'
  if 'mode' in file_content:
    mode = file_content['mode']
  if type(mode) is not str:
    fatal_error('Field \'mode\' must be a string')
  if mode not in ['old_builder', 'new_builder']:
    fatal_error('Field \'mode\' must be \'old_builder\' or \'new_builder\'')
  auth_header = 'Token {}'.format(file_content['token'])
  headers = {'Authorization': auth_header, 'Content-type': 'application/json'}
  wait_time = None
  if 'wait_time' in file_content:
    if type(file_content['wait_time']) not in [float, int]:
      fatal_error('Field \'wait_time\' must be a float or an int')
    wait_time = file_content['wait_time']
  return file_content['conversations'], mode, headers, wait_time

def validate_conversations_format(conversations):
  def validate_gromit_message(msg, nth_conversation, conv_title, nth_message):
    if type(msg) is not dict:
      fatal_error('Messages must be strings or objects, failure in {}th message of {}th conversation with title {}'.format(nth_message, nth_conversation, conv_title))
    if 'type' not in msg:
      fatal_error('Missing \'type\' field in {}th message of {}th conversation with title {}'.format(nth_message, nth_conversation, conv_title))
    if type(msg['type']) is not str:
      fatal_error('Field \'type\' must be a string, {}th message in {}th conversation with title {}'.format(nth_message, nth_conversation, conv_title))
    if 'content' not in msg:
      fatal_error('Missing \'content\' field in {}th message of {}th conversation with title {}'.format(nth_message, nth_conversation, conv_title))
    if msg['type'] == 'text' and type(msg['content']) is not str:
      fatal_error('Field \'content\' of message of type=text must be a string, {}th message in {}th conversation with title {}'.format(nth_message, nth_conversation, conv_title))

  for i,conversation in enumerate(conversations):
    i += 1
    if 'title' not in conversation:
      fatal_error('Missing \'title\' field in {}th conversation'.format(i))
    if type(conversation['title']) is not str:
      fatal_error('Field \'title\' must be a string, {}th conversation'.format(i))
    if 'messages' not in conversation:
      fatal_error('Missing \'messages\' field in {}th conversation with title {}'.format(i, conversation['title']))
    if type(conversation['messages']) is not list:
      fatal_error('Field \'messages\' must be a list, {}th conversation with title {}'.format(i, conversation['title']))
    for x,message in enumerate(conversation['messages']):
      x += 1
      if type(message) is not dict:
        fatal_error('{}th message in {}th conversation with title {} must be an object'.format(x, i, conversation['title']))
      if 'user' not in message:
        fatal_error('Missing \'user\' field in {}th message of {}th conversation with title {}'.format(x, i, conversation['title']))
      if type(message['user']) is str:
        message['user'] = { 'type': 'text', 'content': message['user'] }
      validate_gromit_message(message['user'], i, conversation['title'], x)
      if 'bot' not in message:
        fatal_error('Missing \'bot\' field in {}th message of {}th conversation with title {}'.format(x, i, conversation['title']))
      if type(message['bot']) is not list:
        fatal_error('Field \'bot\' must be a list, {}th message in {}th conversation with title {}'.format(x, i, conversation['title']))
      for y,msgs in enumerate(message['bot']):
        if type(msgs) is not list:
          message['bot'][y] = [msgs]
          msgs = [msgs]
        for z,option in enumerate(msgs):
          if type(option) is str:
            message['bot'][y][z] = { 'type': 'text', 'content': option }
            option = message['bot'][y][z]
          validate_gromit_message(option, i, conversation['title'], x)

""" ============ END INPUT SYNTAX VALIDATION ============ """


""" ============ BUILDERS IMPLEMENTATIONS ============ """

class NewBuilder:
  def __init__(self, headers, wait_time):
    self.headers = headers
    self.wait_time = wait_time

  def dialog(self, message, expect_multiple_messages=False):
    data = {
        'conversation_id': self.conversation_id,
        'message': message
    }
    res = requests.post('{}/dialog'.format(RAFIKI_BASE_URL), json=data, headers=self.headers).json()
    return res['messages']

  def new_conversation(self):
    self.conversation_id = random_string()


class OldBuilder:
  def __init__(self, headers, wait_time):
    self.headers = headers
    self.wait_time = wait_time
    channel_id, channel_token, webhook_url = self.create_directline_channel()
    self.channel_id = channel_id
    self.webhook_url = webhook_url
    self.channel_token = channel_token
    self.first_dialog = True

  def create_directline_channel(self):
    existing_channels = requests.get('{}/channels'.format(CONNECTOR_URL), headers=self.headers).json()['results']
    if existing_channels is None:
      fatal_error('Could not get the channels of your bot, you probably used the wrong token, is it the developer token ?')
    for existing in existing_channels:
      if existing['type'] == 'directline' and existing['slug'] == 'test-my-bot-script':
        return existing['id'], existing['token'], existing['webhook']

    data = {
      'type': 'directline',
      'slug': 'test-my-bot-script'
    }
    created_channel = requests.post('{}/channels'.format(CONNECTOR_URL), json=data, headers=self.headers).json()['results']
    return created_channel['id'], created_channel['token'], created_channel['webhook']

  def get_bot_messages(self):
    headers = {
        'Authorization': self.channel_token
    }
    res = requests.get('{}/webhook/{}/conversations/{}/messages'.format(CONNECTOR_URL, self.channel_id, self.conversation_id), headers=headers).json()['results']
    bot_messages = []
    for elt in res:
      if elt['attachment'] and elt['participant'] and elt['participant']['isBot']:
        bot_messages.append(elt['attachment'])
    return bot_messages

  def dialog(self, message, expect_multiple_messages=False):
    headers = {
        'Authorization': self.channel_token
    }
    if self.first_dialog:
      # creating conversation
      self.first_dialog = False
      res = requests.post('{}/webhook/{}/conversations'.format(CONNECTOR_URL, self.channel_id), headers=headers).json()
      self.conversation_id = res['results']['id']
      ori_nb_messages = 0
    else:
      existing_messages = self.get_bot_messages()
      ori_nb_messages = len(existing_messages)
    data = {
        'message': {
          'attachment': message
        },
        'chatId': self.conversation_id
    }
    requests.post(self.webhook_url, json=data, headers=self.headers)
    retries = 0
    initial_wait = self.wait_time if self.wait_time else 3
    if not expect_multiple_messages:
      initial_wait /= 3
    while True:
      if retries >= 4:
        fatal_error('The bot is not responding, is it up ?')
      time.sleep(initial_wait + (retries * 0.5))
      existing_messages = self.get_bot_messages()
      if len(existing_messages) > ori_nb_messages:
        return existing_messages[ori_nb_messages:]
      retries += 1

  def new_conversation(self):
    self.first_dialog = True

""" ============ END BUILDERS IMPLEMENTATIONS ============ """


print('\033[93mTo get help on how to use this script, run \'./test_my_bot.py help\'\033[0m')
if file == 'help':
  display_help()
  sys.exit()
if file == 'example':
  display_example()
  sys.exit()

conversations, mode, headers, wait_time = parse_first_level(file)
validate_conversations_format(conversations)

# if we have an argument specifying a specific conversation to test
conversations = select_conversation(conversations, conversation)

if mode == 'old_builder':
  builder = OldBuilder(headers, wait_time)
else:
  builder = NewBuilder(headers, wait_time)

succeeded = 0
for conversation in conversations:
  print('\n=== Conversation \'{}\' ==='.format(conversation['title']))
  builder.new_conversation()
  success = True
  for i,exchange in enumerate(conversation['messages']):
    sys.stdout.write('  {}th message : '.format(i + 1))
    sys.stdout.flush()
    expected_msgs = exchange['bot']
    expect_multiple_messages = len(expected_msgs) > 1
    actual_msgs = builder.dialog(exchange['user'], expect_multiple_messages=expect_multiple_messages)
    if len(actual_msgs) != len(expected_msgs):
      print(FAIL_ICON)
      fail_conversation(expected_msgs, actual_msgs, 'Expected \033[93m{}\033[0m messages but got \033[91m{}\033[0m'.format(len(expected_msgs), len(actual_msgs)))
      success = False
      break
    for actual, expected in list(zip(actual_msgs, expected_msgs)):
      ok = False
      for exp in expected:
        ok,mismatch = messages_match(exp, actual)
        if ok:
          break
      if not ok:
        print(FAIL_ICON)
        fail_conversation(expected_msgs, actual_msgs, mismatch)
        success = False
        break
    if not success:
      break
    print(VALID_ICON)
  succeeded += (1 if success else 0)
  # print('{}'.format(VALID_ICON if success else FAIL_ICON))

print('\nSummary :')
if succeeded == len(conversations):
  print('  \033[92mAll conversations succeeded\033[0m 🍾')
elif succeeded == 0:
  print('  \033[91mAll conversations failed\033[0m')
else:
  print('  Success: \033[92m{}\033[0m conversations'.format(succeeded))
  print('  Failure: \033[91m{}\033[0m conversations'.format(len(conversations) - succeeded))
