import DataLoader from "dataloader";
import { In } from "typeorm";
import { Client } from "./client.entity";
import { ClientContacts } from "../clientContacts/clientContacts.entity";

export const clientContactsLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
    const data = await Client.find({
      id: In([...keys]),
      deleted: false,
    });

    let contactsIds: string[] = [];

    data.map(e => {
      const contacts = e.contactIds?.split(',');
      contacts?.map(f => {
        if (!contactsIds.includes(f)) contactsIds.push(f);
      });
    })

    const contacts = (await ClientContacts.find({
      id: In(contactsIds),
    }))?.reduce((a: { [index: string]: ClientContacts }, c: ClientContacts) => {
      if (c.id) a[c.id] = c;
      return a;
    }, {});

    const map: { [key: string]: Array<ClientContacts> } = {};
    data.forEach(e => {
      if (!(e.id in map)) {
        map[e.id] = [];
      }
      const clientContacts = e.contactIds?.split(',');
      clientContacts?.map((d: string) => {
        if (contacts && d in contacts) map[e.id].push(contacts[d]);
      });
    });

    return keys.map(k => map[k]);
});

export const clientLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const datas = await Client.findByIds([...keys.map(e => Number(e))]);

    const map: { [key: string]: Client } = {};
    datas.forEach(u => {
      map[u.id] = u;
    });

    return keys.map(k => map[k]);
  });
