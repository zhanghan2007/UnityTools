using System.IO;
using Luban;
using UnityEngine;

public class ConfigMgr : MonoBehaviour
{
    void Start()
    {
        var tables = new Configs.Tables(LoadByteBuf);
        Debug.Log(tables.TbReward.Get(1001).Name);
    }

    private ByteBuf LoadByteBuf(string file)
    {
        string gameConfDir = Application.dataPath + "/Games_AssetBundle/Configs";
        return new ByteBuf(File.ReadAllBytes($"{gameConfDir}/{file}.bytes"));
    }

}
